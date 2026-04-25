import { type FC } from "react";
import { Box, Container, Grid, Heading, Text, VStack, Flex, HStack, Badge } from "@chakra-ui/react";
import { Check } from "lucide-react";

// Brand SVGs — sized via viewBox, scaled by parent
const ZoomLogo = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect width="64" height="64" rx="14" fill="#0B5CFF" />
    <path
      d="M14 22a4 4 0 0 1 4-4h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V22zm32 6.5l8-5.2v17.4l-8-5.2v-7z"
      fill="#fff"
    />
  </svg>
);

const TeamsLogo = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <g transform="translate(6 14)">
      <rect x="0" y="3" width="32" height="32" rx="4" fill="#5059C9" />
      <text x="16" y="27" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700" fontFamily="Inter">
        T
      </text>
      <circle cx="42" cy="11" r="7" fill="#7B83EB" />
      <ellipse cx="42" cy="27" rx="10" ry="8" fill="#7B83EB" />
    </g>
  </svg>
);

const MeetLogo = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <g transform="translate(4 18)">
      <rect x="2" y="2" width="36" height="26" rx="3" fill="#00832D" />
      <path d="M38 8l16-6v24l-16-6V8z" fill="#0066DA" />
      <rect x="2" y="2" width="7" height="26" fill="#FFBA00" />
      <rect x="31" y="2" width="7" height="26" fill="#E94235" />
    </g>
  </svg>
);

const WebexLogo = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <g transform="translate(8 12)">
      <path
        d="M24 0C14 0 8 8 4 16 1.5 20 0 24 0 26c0 2 1.5 6 4 10 4 8 10 14 20 14s16-6 20-14c2.5-4 4-8 4-10 0-2-1.5-6-4-10C40 8 34 0 24 0z"
        fill="#00BCEB"
      />
      <circle cx="24" cy="16" r="6" fill="#fff" opacity="0.9" />
    </g>
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <g transform="translate(11 11)">
      <rect x="0" y="17" width="11" height="11" rx="5.5" fill="#36C5F0" />
      <rect x="17" y="32" width="11" height="11" rx="5.5" fill="#2EB67D" />
      <rect x="32" y="17" width="11" height="11" rx="5.5" fill="#ECB22E" />
      <rect x="17" y="0" width="11" height="11" rx="5.5" fill="#E01E5A" />
      <rect x="17" y="17" width="11" height="11" fill="#36C5F0" />
    </g>
  </svg>
);

type Platform = {
  name: string;
  Logo: FC;
  detected?: boolean;
};

const PLATFORMS: Platform[] = [
  { name: "Zoom", Logo: ZoomLogo, detected: true },
  { name: "Microsoft Teams", Logo: TeamsLogo, detected: true },
  { name: "Google Meet", Logo: MeetLogo },
  { name: "Webex", Logo: WebexLogo },
  { name: "Slack Huddles", Logo: SlackLogo },
];

const PlatformTile: FC<{ platform: Platform; iconSize?: number }> = ({ platform, iconSize = 88 }) => (
  <Box
    bg="white"
    borderRadius="2xl"
    border="1px solid"
    borderColor="ink.100"
    boxShadow="0 4px 16px -4px rgba(15, 23, 42, 0.06)"
    transition="all 0.2s"
    _hover={{ transform: "translateY(-3px)", boxShadow: "0 16px 32px -8px rgba(15, 23, 42, 0.14)" }}
    position="relative"
    h="full"
    display="flex"
    alignItems="center"
    justifyContent="center"
    aria-label={platform.name}
  >
    <Box w={`${iconSize}px`} h={`${iconSize}px`}>
      <platform.Logo />
    </Box>
    {platform.detected && (
      <Badge
        position="absolute"
        top="12px"
        right="12px"
        bg="teal.50"
        color="teal.700"
        fontSize="10px"
        fontWeight="600"
        px={2}
        py={0.5}
        borderRadius="full"
        textTransform="none"
        letterSpacing="0"
        display="flex"
        alignItems="center"
        gap={1}
      >
        <Check size={10} strokeWidth={3} />
        Auto
      </Badge>
    )}
  </Box>
);

export const MeetingPlatforms: FC = () => {
  return (
    <Box bg="white" py={{ base: 20, md: 28 }} borderTop="1px solid" borderColor="ink.100">
      <Container maxW="7xl">
        <Grid
          templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1.1fr)" }}
          gap={{ base: 12, lg: 20 }}
          alignItems="center"
        >
          <VStack align="flex-start" spacing={6}>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="teal.600"
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Quietly listens
            </Text>
            <Heading
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="700"
              letterSpacing="-0.03em"
              lineHeight={1.05}
              color="ink.900"
            >
              Detects your meeting.
              <br />
              Stays out of your call.
            </Heading>
            <Text fontSize="lg" color="ink.600" lineHeight={1.55}>
              Platypus notices when Zoom or Teams kicks off a call and offers to start recording. Nothing ever joins
              your meeting — your computer just listens, locally.
            </Text>

            <VStack align="flex-start" spacing={3} pt={2}>
              <HStack spacing={3}>
                <Flex
                  w="22px"
                  h="22px"
                  borderRadius="full"
                  bg="teal.100"
                  color="teal.700"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Check size={12} strokeWidth={3} />
                </Flex>
                <Text fontSize="sm" color="ink.700">
                  No bots, no calendar invites, no permissions to share with attendees
                </Text>
              </HStack>
              <HStack spacing={3}>
                <Flex
                  w="22px"
                  h="22px"
                  borderRadius="full"
                  bg="teal.100"
                  color="teal.700"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Check size={12} strokeWidth={3} />
                </Flex>
                <Text fontSize="sm" color="ink.700">
                  Auto-detection for Zoom and Microsoft Teams today
                </Text>
              </HStack>
              <HStack spacing={3}>
                <Flex
                  w="22px"
                  h="22px"
                  borderRadius="full"
                  bg="teal.100"
                  color="teal.700"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Check size={12} strokeWidth={3} />
                </Flex>
                <Text fontSize="sm" color="ink.700">
                  Manual recording works with any meeting platform — or any conversation
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Platform tile grid — 3 cols x 2 rows, Teams features tall, uniform icon size */}
          <Grid templateColumns="repeat(3, 1fr)" gap={4} templateRows="repeat(2, 170px)">
            {/* Zoom — top left (auto) */}
            <Box gridColumn="1 / 2" gridRow="1 / 2">
              <PlatformTile platform={PLATFORMS[0]} iconSize={72} />
            </Box>
            {/* Meet — top center */}
            <Box gridColumn="2 / 3" gridRow="1 / 2">
              <PlatformTile platform={PLATFORMS[2]} iconSize={72} />
            </Box>
            {/* Teams — right, spans both rows (featured, auto) */}
            <Box gridColumn="3 / 4" gridRow="1 / 3">
              <PlatformTile platform={PLATFORMS[1]} iconSize={80} />
            </Box>
            {/* Webex — bottom left */}
            <Box gridColumn="1 / 2" gridRow="2 / 3">
              <PlatformTile platform={PLATFORMS[3]} iconSize={72} />
            </Box>
            {/* Slack — bottom center */}
            <Box gridColumn="2 / 3" gridRow="2 / 3">
              <PlatformTile platform={PLATFORMS[4]} iconSize={72} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
