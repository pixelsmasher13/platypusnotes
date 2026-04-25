export const GITHUB_URL = "https://github.com/pixelsmasher13/platypus";
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`;

// macOS .dmg lives in S3, mirrored to a stable "latest" key by scripts/build-mac.sh
export const DOWNLOAD_MAC = "https://the-platypus-app.s3.amazonaws.com/PlatypusNotes-latest.dmg";

// Windows installer not yet published — point at the GitHub releases page until then
export const DOWNLOAD_WINDOWS = RELEASES_URL;
