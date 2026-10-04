"use client";

import React from "react";
import "./site.css";
import Intro from "@/components/site/Intro";
import Nav from "@/components/site/Nav";
import OfferBar from "@/components/site/OfferBar";
import Footer from "@/components/site/Footer";
import StorySection from "@/components/story/StorySection";
import ManifestoSection from "@/components/sections/ManifestoSection";
import TrackSection from "@/components/sections/TrackSection";
import ServicesSection from "@/components/sections/ServicesSection";
import RatesSection from "@/components/sections/RatesSection";
import NetworkSection from "@/components/sections/NetworkSection";
import ReviewsSection from "@/components/sections/ReviewsSection";

export default function SitePage() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        <StorySection />
        <ManifestoSection />
        <TrackSection />
        <ServicesSection />
        <RatesSection />
        <NetworkSection />
        <ReviewsSection />
      </main>
      <Footer />
      <OfferBar />
    </>
  );
}
