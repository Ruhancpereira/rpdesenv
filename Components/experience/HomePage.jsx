import Head from "next/head";
import { ReactLenis } from "lenis/react";
import Constellation from "@/Components/experience/Constellation";
import OpeningSequence from "@/Components/experience/OpeningSequence";
import SiteNav from "@/Components/experience/SiteNav";
import ScrollRail from "@/Components/experience/ScrollRail";
import HeroChapter from "@/Components/experience/HeroChapter";
import ServicesChapter from "@/Components/experience/ServicesChapter";
import MethodChapter from "@/Components/experience/MethodChapter";
import WorkChapter from "@/Components/experience/WorkChapter";
import ContactChapter from "@/Components/experience/ContactChapter";
import SiteFooter from "@/Components/experience/SiteFooter";

export default function Home() {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.085,
        anchors: true,
        stopInertiaOnNavigate: true,
        syncTouch: false,
      }}
    >
      <Head>
        <title>RP Sistemas | Engenharia de sistemas</title>
        <meta
          name="description"
          content="RP Sistemas projeta e constrói software sob medida: sistemas web, aplicativos e plataformas empresariais. Suporte em contato@rpsistemas.cloud."
        />
        <link rel="icon" href="/brand-mark.png" />
      </Head>

      <div className="rp-cursor relative min-h-screen bg-[#072A5E] text-white">
        <div className="pointer-events-none fixed inset-0 z-0">
          <Constellation />
        </div>
        <div className="noise" />
        <OpeningSequence />
        <SiteNav />
        <ScrollRail />
        <main className="relative z-10">
          <HeroChapter />
          <ServicesChapter />
          <MethodChapter />
          <WorkChapter />
          <ContactChapter />
        </main>
        <SiteFooter />
      </div>
    </ReactLenis>
  );
}
