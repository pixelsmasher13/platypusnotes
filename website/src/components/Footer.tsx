import { type FC } from "react";
import { Box, Container, Flex, Text, HStack, Image, Link } from "@chakra-ui/react";
import { GITHUB_URL } from "../links";

export const Footer: FC = () => {
  return (
    <Box bg="ink.950" color="ink.500" py={10}>
      <Container maxW="7xl">
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={4}>
          <HStack spacing={2.5}>
            <Image src="/app-icon.png" alt="Platypus" boxSize="22px" opacity={0.85} borderRadius="5px" />
            <Text fontSize="sm" color="ink.300" fontWeight="500" letterSpacing="-0.01em">
              Platypus
            </Text>
          </HStack>
          <Text fontSize="xs" ml={{ md: "auto" }} color="ink.500">
            © {new Date().getFullYear()} Platypus Notes · Open source under MIT
          </Text>
          <HStack spacing={5}>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="xs"
              color="ink.400"
              _hover={{ color: "white", textDecoration: "none" }}
            >
              GitHub
            </Link>
            <Link fontSize="xs" color="ink.400" _hover={{ color: "white", textDecoration: "none" }} href="#privacy">
              Privacy
            </Link>
            <Link fontSize="xs" color="ink.400" _hover={{ color: "white", textDecoration: "none" }} href="mailto:hello@platypusnotes.com">
              Contact
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
