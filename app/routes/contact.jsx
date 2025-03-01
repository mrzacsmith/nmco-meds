import { Layout } from "~/components/Layout";
import { ContactPage } from "~/components/ContactPage";
import { useDomain } from "~/context/DomainContext";

export const meta = () => {
  return [
    { title: "Contact Us | Cannabis Directory" },
    { name: "description", content: "Get in touch with our team for questions, feedback, or support." },
  ];
};

export default function Contact() {
  const domain = useDomain();

  // Update meta tags dynamically based on domain
  meta.title = `Contact ${domain.name} | Cannabis Directory for ${domain.state}`;
  meta.description = `Get in touch with the ${domain.name} team for questions, feedback, or support regarding cannabis services in ${domain.state}.`;

  return (
    <Layout>
      <ContactPage />
    </Layout>
  );
} 