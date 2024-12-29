/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:lang/hosting/listings/editor/:roomId",
        destination: "/:lang/hosting/listings/editor/:roomId/details/photo-tour",
        permanent: true,
      },
      {
        source: "/:lang/hosting/listings/editor",
        destination: "/:lang/hosting/listings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
