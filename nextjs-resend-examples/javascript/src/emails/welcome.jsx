/**
 * Welcome Email Template
 *
 * A React Email template for welcoming new users.
 *
 * @param {{ name: string, actionUrl?: string }} props
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

export function WelcomeEmail({
  name,
  actionUrl = 'https://example.com/dashboard',
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to Acme - Let&apos;s get started!</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="text-2xl font-bold text-gray-900 mt-8">
              Welcome aboard, {name}!
            </Heading>

            <Text className="text-base text-gray-700 leading-6">
              We&apos;re thrilled to have you join us. Your account is all set
              up and ready to go.
            </Text>

            <Text className="text-base text-gray-700 leading-6">
              Click the button below to access your dashboard and explore
              everything Acme has to offer.
            </Text>

            <Button
              href={actionUrl}
              className="bg-black text-white px-6 py-3 rounded-md font-medium mt-4 inline-block box-border"
            >
              Go to Dashboard
            </Button>

            <Hr className="border-gray-200 my-8" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t create an account with Acme, you can safely
              ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Preview props for React Email dev server
WelcomeEmail.PreviewProps = {
  name: 'John Doe',
  actionUrl: 'https://example.com/dashboard',
};

export default WelcomeEmail;
