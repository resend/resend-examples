/**
 * Contact Form Notification Email
 *
 * Sent to the site owner when someone submits a contact form.
 *
 * @param {{ name: string, email: string, message: string, submittedAt: string }} props
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

export function ContactNotificationEmail({
  name,
  email,
  message,
  submittedAt,
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New contact form submission from {name}</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <div className="bg-blue-50 border border-solid border-blue-200 rounded-md p-4 mb-6">
              <Text className="text-sm text-blue-800 m-0">
                New contact form submission
              </Text>
            </div>

            <Heading className="text-xl font-bold text-gray-900">
              Message from {name}
            </Heading>

            <div className="bg-gray-50 rounded-md p-4 my-4">
              <Text className="text-sm text-gray-600 m-0">
                <strong>From:</strong> {name}
              </Text>
              <Text className="text-sm text-gray-600 m-0 mt-1">
                <strong>Email:</strong>{' '}
                <Link href={`mailto:${email}`} className="text-blue-600">
                  {email}
                </Link>
              </Text>
              <Text className="text-sm text-gray-600 m-0 mt-1">
                <strong>Received:</strong> {submittedAt}
              </Text>
            </div>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Message:
            </Text>
            <Text className="text-base text-gray-700 leading-6 whitespace-pre-wrap">
              {message}
            </Text>

            <Hr className="border-gray-200 my-6" />

            <Link
              href={`mailto:${email}?subject=Re: Your message to Acme`}
              className="bg-black text-white px-4 py-2 rounded-md font-medium no-underline inline-block box-border"
            >
              Reply to {name}
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ContactNotificationEmail.PreviewProps = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  message: "Hi, I'm interested in your enterprise plan.",
  submittedAt: 'February 2, 2026 at 10:30 AM',
};

export default ContactNotificationEmail;
