// import ProgressBar from "@/components/Common/ProgressBar";
// import Provider from "@/components/Provider";
import { Dictionary, getDictionary, getLocaleSystems, Locale } from "@/libs/dictionary.lib";
// import { Toaster } from "sonner";
import "@/assets/styles/globals.css"
import { cn } from "@/utils/dom.util";
import { airbnbFont } from "@/fonts";
import { Metadata } from "next";
// import { getHeaderValue } from "@/libs/next-headers";

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: {
    lang: Locale;
  }
}

export async function generateMetadata(
  { params }: RootLayoutProps
): Promise<Metadata> {
  const lang = params.lang
  const d = await getDictionary(lang, "home") as Dictionary["home"];

  return {
    title: "Airbnb | Nhà nghỉ dưỡng cho thuê, cabin, nhà trên bãi biển, v.v.",
    twitter: {
      title: d.metaData.title
    }
  }
}

export default async function RootLayout({
  // children,
  params: {
    lang
  },
  // modal
}: RootLayoutProps) {
  const [
    // dictionary,
    // localeSystems
  ] = await Promise.all([
    getDictionary(lang),
    getLocaleSystems()
  ]);

  // const profile = getHeaderValue("user");
  // const isAuthorization = getHeaderValue("isAuthorization");

  return (
    <html lang={lang} suppressHydrationWarning className="h-full w-full">
      <body
        className={cn(airbnbFont.className, "min-h-screen h-full w-full bg-content1")}
        style={{
          top: "0px",
        }}
      >
        test
        {/* <ProgressBar />
        <Provider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark"]}
          profile={profile}
          dictionary={dictionary as Dictionary}
          localeSystems={localeSystems}
          isAuthorization={isAuthorization}
          lang={lang}
        >
          {children}
          {modal}
          <Toaster richColors closeButton position="bottom-center" />
        </Provider> */}
      </body>
    </html>
  )
}
