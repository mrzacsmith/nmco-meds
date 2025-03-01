import { Layout } from "~/components/Layout";
import { AboutPage } from "~/components/AboutPage";
import { useDomain } from "~/context/DomainContext";

export const meta = () => {
  return [
    { title: "About Us | Cannabis Directory" },
    { name: "description", content: "Learn more about our cannabis directory service and our mission." },
  ];
};

export default function About() {
  const domain = useDomain();

  // Update meta tags dynamically based on domain
  meta.title = `About ${domain.name} | Cannabis Directory for ${domain.state}`;
  meta.description = `Learn more about ${domain.name}, the premier cannabis directory for ${domain.state}.`;

  return (
    <Layout>
      <AboutPage />
    </Layout>
  );
} 