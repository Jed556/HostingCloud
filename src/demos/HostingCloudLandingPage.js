import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Hero from "components/hero/TwoColumnWithPrimaryBackground.js";
import Features from "components/features/ThreeColWithSideImageWithPrimaryBackground.js";
import MainFeature from "components/features/TwoColWithButton.js";
import Pricing from "components/pricing/ThreePlansWithHalfPrimaryBackground.js";
import Testimonial from "components/testimonials/SimplePrimaryBackground.js";
import FAQ from "components/faqs/TwoColumnPrimaryBackground.js";
import Footer from "components/footers/FiveColumnDark.js";
import FloatingDraggableCircle from "components/misc/FloatingDraggableCircle";

import serverRedundancyIllustrationImageSrc from "images/server-redundancy-illustration.svg"
import serverSecureIllustrationImageSrc from "images/server-secure-illustration.svg"

import SupportIconImage from "images/support-icon.svg";
import ShieldIconImage from "images/shield-icon.svg";
import CustomizeIconImage from "images/customize-icon.svg";
import FastIconImage from "images/fast-icon.svg";
import ReliableIconImage from "images/reliable-icon.svg";
import SimpleIconImage from "images/simple-icon.svg";


const featureCards = [
  {
    imageSrc: ShieldIconImage,
    title: "Secure",
    description: "We strictly only deal with vendors that provide top notch security infrastructure."
  },
  {
    imageSrc: SupportIconImage,
    title: "24/7 Support",
    description: "Our expert team is available around the clock to assist you with any issues or questions."
  },
  {
    imageSrc: CustomizeIconImage,
    title: "Customizable",
    description: "Easily tailor your hosting environment to fit your unique business needs and preferences."
  },
  {
    imageSrc: ReliableIconImage,
    title: "Reliable",
    description: "Enjoy industry-leading uptime and dependable performance for your critical applications."
  },
  {
    imageSrc: FastIconImage,
    title: "Fast",
    description: "Experience lightning-fast load times and optimized server performance for your websites."
  },
  {
    imageSrc: SimpleIconImage,
    title: "Easy",
    description: "Get started quickly with our intuitive setup and user-friendly management tools."
  }
];

const faqs = [
  {
    question: "What is cloud hosting?",
    answer: "Cloud hosting uses a network of virtual servers to host websites and applications, offering greater reliability and scalability compared to traditional hosting."
  },
  {
    question: "How secure is my data?",
    answer: "We implement advanced security protocols, regular audits, and real-time monitoring to ensure your data is always protected."
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Yes, you can easily upgrade or downgrade your hosting plan at any time to fit your needs."
  },
  {
    question: "Do you offer 24/7 support?",
    answer: "Absolutely! Our expert support team is available around the clock to assist you."
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
  }
];

const plans = [
  {
    name: "Personal",
    price: ["₱499", "/month"],
    oldPrice: "₱599",
    description: "Perfect for when you want to host your personal blog or a hobby side project.",
    features: ["2 Core Xeon CPU", "1 GB RAM", "30 GB SSD", "1 TB Transfer", "99.9% Uptime"],
    url: ""
  },
  {
    name: "Business",
    price: ["₱899", "/month"],
    oldPrice: "₱1099",
    description: "Perfect for hosting blogs with lots of traffic or heavy development projects",
    features: [
      "4 Core Xeon CPU",
      "2 GB RAM",
      "100 GB SSD",
      "3 TB Transfer",
      "99.9% Uptime",
      "Free Domain & SSL",
      "Free DNS Management"
    ],
    url: "",
    featured: "Most Popular"
  },
  {
    name: "Enterprise",
    price: ["₱1499", "/month"],
    oldPrice: "₱1799",
    description: "Perfect for hosting production websites & API services with high traffic load",
    features: [
      "8 Core Xeon CPU",
      "8 GB RAM",
      "300 GB SSD",
      "Unlimited Transfer",
      "99.99% Uptime",
      "Free Domain & SSL",
      "Free DNS Management",
      "Free Offsite Backup"
    ],
    url: ""
  }
];

export default () => {
  return (
    <>
      <FloatingDraggableCircle />
      <AnimationRevealPage>
        <Hero
          heading="Welcome to HostingCloud"
          description="Experience reliable, secure, and scalable cloud hosting solutions tailored for your business. Get started with HostingCloud today and power your online presence with confidence."
          primaryButtonText="Start 15 Day Free Trial"
          primaryButtonUrl=""
        />
        <Features
          heading="Our Features"
          description="Discover industry-leading uptime, lightning-fast performance, and 24/7 expert support. HostingCloud is built to help your business grow."
          cards={featureCards}
        />
        <Pricing
          heading="Pricing Plans"
          description="Flexible plans for every need. Whether you're just starting out or scaling up, HostingCloud has you covered."
          plans={plans}
        />
        <MainFeature
          subheading="Reliable"
          heading="Highly Redundant Servers With Backup"
          description="Our infrastructure is designed for maximum reliability, featuring automatic failover and daily backups to keep your data safe and your site online."
          imageSrc={serverRedundancyIllustrationImageSrc}
          buttonRounded={false}
        />
        <MainFeature
          subheading="Secure"
          heading="State of the Art Computer Security"
          description="We use advanced security protocols, regular audits, and real-time monitoring to ensure your data is always protected."
          imageSrc={serverSecureIllustrationImageSrc}
          buttonRounded={false}
          textOnLeft={false}
        />
        <Testimonial
          heading="What Our Customers Say"
          description="See why thousands of businesses trust HostingCloud for their hosting needs."
        />
        <FAQ
          heading="Frequently Asked Questions"
          description="Have questions? We have answers. Learn more about HostingCloud's services and support."
          faqs={faqs}
        />
        <Footer />
      </AnimationRevealPage>
    </>
  );
}
