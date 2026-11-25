import { createPolar, type models } from '@polar-sh/sdk/2026-10';
import inquirer from 'inquirer';
import { PRICING } from '../';

export function formatEventsCount(events: number) {
  return new Intl.NumberFormat('en-gb', {
    notation: 'compact',
  }).format(events);
}

interface Answers {
  isProduction: boolean;
  polarOrganizationId: string;
  polarApiKey: string;
}

async function promptForInput(): Promise<Answers> {
  // Read from the environment first, so the script can run unattended and the
  // API key never has to be typed or pasted anywhere. Put these in the root
  // .env (gitignored):
  //
  //   POLAR_SERVER=sandbox            # or production
  //   POLAR_ACCESS_TOKEN=polar_oat_...
  //   POLAR_ORGANIZATION_ID=...       # not needed for an _oat_ token
  //
  // Anything missing is still prompted for, so the original interactive flow
  // keeps working.
  const envServer = process.env.POLAR_SERVER;
  const envApiKey = process.env.POLAR_ACCESS_TOKEN;
  const envOrganizationId = process.env.POLAR_ORGANIZATION_ID;

  const prompts = [];

  if (envServer !== 'sandbox' && envServer !== 'production') {
    prompts.push({
      type: 'list',
      name: 'isProduction',
      message: 'Is this for production?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      default: true,
    });
  }

  // An organization access token (polar_oat_) is already scoped to one
  // organization, so the id is redundant there.
  if (!(envOrganizationId || envApiKey?.includes('_oat_'))) {
    prompts.push({
      type: 'string',
      name: 'polarOrganizationId',
      message: 'Enter your Polar organization ID:',
    });
  }

  if (!envApiKey) {
    prompts.push({
      type: 'password',
      name: 'polarApiKey',
      message: 'Enter your Polar API key:',
      mask: '*',
      validate: (input: string) => {
        if (!input) {
          return 'API key is required';
        }
        return true;
      },
    });
  }

  const answers = prompts.length
    ? await inquirer.prompt<Partial<Answers>>(prompts as never)
    : {};

  return {
    isProduction:
      envServer === 'production'
        ? true
        : envServer === 'sandbox'
          ? false
          : Boolean(answers.isProduction),
    polarOrganizationId:
      envOrganizationId ?? answers.polarOrganizationId ?? '',
    polarApiKey: envApiKey ?? answers.polarApiKey ?? '',
  };
}

async function main() {
  const input = await promptForInput();

  const polar = createPolar({
    accessToken: input.polarApiKey!,
    environment: input.isProduction ? 'production' : 'sandbox',
  });

  async function getProducts() {
    const products = await polar.products.list({
      limit: 100,
      is_archived: false,
      sorting: ['price_amount'],
    });
    return products.items.filter((product) => {
      return (
        product.metadata.custom !== 'true' && product.metadata.custom !== true
      );
    });
  }

  const isDry = process.argv.includes('--dry');
  const products = await getProducts();
  const createProducts: models.Product[] = [];
  console.log(
    `\nPolar: ${input.isProduction ? 'PRODUCTION' : 'sandbox'} — ${products.length} existing product(s)\n`,
  );

  for (const price of PRICING) {
    if (price.price === 0) {
      const exists = products.find(
        (p) =>
          p.metadata?.eventsLimit === price.events &&
          p.recurring_interval === 'month'
      );
      if (exists) {
        console.log('Free product already exists:');
        console.log(' - ID:', exists.id);
        console.log(' - Name:', exists.name);
      } else if (isDry) {
        // Without this the free branch would create even on a dry run. Our
        // PRICING has no zero-price tier today, so it is latent, but a dry run
        // that writes is the last thing you want in production.
        console.log(
          `WOULD CREATE  ${formatEventsCount(price.events)} events per month (FREE)  free/month  eventsLimit=${price.events}`,
        );
      } else {
        const product = await polar.products.create({
          organization_id: input.polarApiKey.includes('_oat_')
            ? undefined
            : input.polarOrganizationId,
          name: `${formatEventsCount(price.events)} events per month (FREE)`,
          recurring_interval: 'month',
          prices: [
            {
              amount_type: 'free',
            },
          ],
          metadata: {
            eventsLimit: price.events,
          },
        });
        console.log('Free product created:');
        console.log(' - ID:', product.id);
        console.log(' - Name:', product.name);
      }

      continue;
    }

    const productCreate: models.ProductCreateRecurring = {
      organization_id: input.polarApiKey.includes('_oat_')
        ? undefined
        : input.polarOrganizationId,
      name: `${formatEventsCount(price.events)} events per month`,
      prices: [
        {
          price_amount: price.price * 100,
          amount_type: 'fixed',
          // EUR, not upstream's USD. Privytics prices in euros everywhere that
          // matters: the pricing page, the /for guides, and the Terms, which
          // state "All prices are stated in euros (EUR)". Creating USD products
          // would contradict a published contractual claim and charge customers
          // in the wrong currency. Polar supports EUR as a presentment currency.
          price_currency: 'eur',
          // VAT is added on top of this amount, never carved out of it.
          //
          // Pinned rather than left to the Polar organization default, which is
          // `location`: that resolves to inclusive for EU customers and
          // exclusive for US ones, so the same plan would net EUR 40 from an
          // American and EUR 33.06 from a Spaniard. Our Terms say "Prices
          // exclude VAT" and "VAT is calculated and added at checkout", so
          // exclusive is the only setting that matches what we publish.
          tax_behavior: 'exclusive',
        },
      ],
      recurring_interval: 'month',
      metadata: {
        eventsLimit: price.events,
      },
    };

    if (isDry) {
      // A dry run is the only preview available before an irreversible step:
      // Polar products can be archived but never deleted. Show exactly what
      // would be created, including the currency, which is the thing most
      // likely to be wrong.
      const yearlyName = `${productCreate.name} (yearly)`;
      const findExisting = (name: string, interval: 'month' | 'year') =>
        products.find(
          (p) =>
            p.metadata?.eventsLimit === price.events &&
            p.recurring_interval === interval &&
            p.name === name,
        );

      for (const [name, interval, amount] of [
        [productCreate.name, 'month', price.price],
        [yearlyName, 'year', price.price * 10],
      ] as const) {
        const found = findExisting(name, interval);
        if (found) {
          // Report what is actually on the product, not what we would have
          // sent. Currency is fixed at creation and cannot be edited, so a
          // product created in the wrong one has to be archived and replaced —
          // this line is how you catch that.
          const fixed = found.prices.find((p) => p.amount_type === 'fixed');
          const actual = fixed
            ? `${fixed.price_currency.toUpperCase()} ${fixed.price_amount / 100}/${interval}`
            : 'free';
          console.log(`EXISTS        ${name.padEnd(34)} ${actual}`);
          continue;
        }
        console.log(
          `WOULD CREATE  ${name.padEnd(34)} EUR ${String(amount).padStart(4)}/${interval} excl. VAT  eventsLimit=${price.events}`,
        );
      }
      console.log('---');
      continue;
    }

    {
      const monthlyProductExists = products.find(
        (p) =>
          p.metadata?.eventsLimit === price.events &&
          p.recurring_interval === 'month' &&
          p.name === productCreate.name
      );
      const yearlyProductExists = products.find(
        (p) =>
          p.metadata?.eventsLimit === price.events &&
          p.recurring_interval === 'year' &&
          p.name === `${productCreate.name} (yearly)`
      );

      if (monthlyProductExists) {
        console.log('Monthly product already exists:');
        console.log(' - ID:', monthlyProductExists.id);
        console.log(' - Name:', monthlyProductExists.name);
        console.log(' - Prices:', monthlyProductExists.prices);
      } else {
        // monthly
        const monthlyProduct = await polar.products.create(productCreate);
        console.log('Monthly product created:');
        console.log(' - ID:', monthlyProduct.id);
        console.log(' - Name:', monthlyProduct.name);
        console.log(' - Prices:', monthlyProduct.prices);
        console.log(' - Recurring Interval:', monthlyProduct.recurring_interval);
        console.log(' - Events Limit:', monthlyProduct.metadata?.eventsLimit);
        createProducts.push(monthlyProduct);
      }

      if (yearlyProductExists) {
        console.log('Yearly product already exists:');
        console.log(' - ID:', yearlyProductExists.id);
        console.log(' - Name:', yearlyProductExists.name);
        console.log(' - Prices:', yearlyProductExists.prices);
      } else {
        // yearly
        productCreate.name = `${productCreate.name} (yearly)`;
        productCreate.recurring_interval = 'year';
        if (
          productCreate.prices[0] &&
          'price_amount' in productCreate.prices[0]
        ) {
          productCreate.prices[0]!.price_amount = price.price * 100 * 10;
        }
        const yearlyProduct = await polar.products.create(productCreate);
        console.log('Yearly product created:');
        console.log(' - ID:', yearlyProduct.id);
        console.log(' - Name:', yearlyProduct.name);
        console.log(' - Prices:', yearlyProduct.prices);
        console.log(' - Recurring Interval:', yearlyProduct.recurring_interval);
        console.log(' - Events Limit:', yearlyProduct.metadata?.eventsLimit);
        createProducts.push(yearlyProduct);
      }
    }
    console.log('---');
  }

  if (createProducts.length > 0) {
    console.log('Create below products:');
    for (const product of createProducts) {
      console.log('Product created:');
      console.log(' - ID:', product.id);
      console.log(' - Name:', product.name);
      console.log(' - Prices:', product.prices);
      console.log(' - Recurring Interval:', product.recurring_interval);
      console.log(' - Events Limit:', product.metadata?.eventsLimit);
    }
  }
}

main();
