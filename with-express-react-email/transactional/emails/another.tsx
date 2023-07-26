import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Tailwind,
  Section,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

// eslint-disable-next-line max-len
const pythonImage =
  'https://firebasestorage.googleapis.com/v0/b/profound-academy.appspot.com/o/pictures%2FuuW6dg09icdYh6CvZsVCBPBRYG32%2Fpython-intro.webp?alt=media&token=622d9d97-67fb-4a75-9abf-75ccd96835e9';
// eslint-disable-next-line max-len
const algoImage =
  'https://firebasestorage.googleapis.com/v0/b/profound-academy-4fe37.appspot.com/o/courses%2Falgorithms-data-structures%2Fbackgrounds%2Fmartin97_A_wallpaper_with_formulas_and_graphs_for_an_algorithmi_f6caa634-3081-4ec7-9ca4-0f03a3eb2742.webp?alt=media&token=0b0622d6-6558-4a43-a980-722bea178fa6';

export const WelcomeEmail = ({ name }: { name?: string }) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            brand: '#fa541c',
          },
        },
      },
    }}
  >
    <Html>
      <Head />
      <Preview>Welcome to Profound Academy!</Preview>
      <Body>
        <Container className="bg-white my-auto mx-auto font-sans">
          <Section className="p-2">
            <Img
              src="https://profound.academy/logo.svg"
              width="50"
              height="50"
              alt="Profound Academy"
              className="mx-auto block"
            />
          </Section>

          <Section className="p-2">
            <Text style={paragraph}>
              Hey {name || 'there'}, welcome to Profound Academy!
            </Text>
            <Text style={paragraph}>
              Here at Profound Academy, we believe in hands-on experience and
              mastery-based learning. All the materials taught on the platform
              focus on practice and an in-depth understanding of topics. You
              won&apos;t need any setup or software installation - just open{' '}
              <Link className="text-brand" href="https://profound.academy/">
                profound.academy
              </Link>{' '}
              and start coding!
            </Text>
          </Section>

          <Section className="p-2">
            <Row>
              <Column className="w-[50%]">
                <Img
                  width="80%"
                  height="100%"
                  alt="Introduction to Python"
                  src={pythonImage}
                />
              </Column>

              <Column>
                <Heading className="text-center text-2xl">
                  Introduction to Python
                </Heading>
                <Text style={paragraph}>
                  If you&apos;re starting your journey, you might be interested
                  in the introductory course to Python
                </Text>
                <Button
                  pY={10}
                  style={button}
                  href="https://profound.academy/python-introduction"
                >
                  Start the Course
                </Button>
              </Column>
            </Row>
          </Section>

          <Section className="p-2">
            <Row>
              <Column className="w-[50%]">
                <Heading className="text-center text-2xl">
                  Algorithms and Data Structures
                </Heading>
                <Text style={paragraph}>
                  If you&apos;re starting your journey, you might be interested
                  in the introductory course to Python
                </Text>
                <Button
                  pY={10}
                  style={button}
                  href="https://profound.academy/python-introduction"
                >
                  Start the Course
                </Button>
              </Column>

              <Column>
                <Img
                  width="80%"
                  height="100%"
                  alt="Introduction to Python"
                  src={pythonImage}
                />
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default WelcomeEmail;

const button = {
  backgroundColor: '#fa541c',
  borderRadius: '50px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};
