import { Hr, Link, Section, Text } from '@react-email/components';

export function Footer({ unsubscribeUrl }: { unsubscribeUrl?: string }) {
  return (
    <>
      <Hr />
      <Section className="w-full p-6">
        <Text className="font-regular text-[21px]" style={{ margin: 0 }}>
          <Link
            className="text-inherit no-underline"
            href="https://privytics.com"
          >
            Privacy-first product analytics
          </Link>
        </Text>

        <Text className="text-[#707070] text-[14px]">
          Questions? Email us at{' '}
          <Link href="mailto:support@privytics.com">support@privytics.com</Link>
          .
        </Text>

        {unsubscribeUrl && (
          <Link
            className="text-[#707070] text-[14px]"
            href={unsubscribeUrl}
            title="Unsubscribe"
          >
            Notification preferences
          </Link>
        )}
      </Section>
    </>
  );
}
