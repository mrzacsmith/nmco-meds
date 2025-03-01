import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { HomePage } from "~/components/HomePage";
import { useDomain } from "~/context/DomainContext";

export const meta = () => {
  return [
    { title: "Cannabis Directory | Find Dispensaries & Delivery Services" },
    { name: "description", content: "Find the best cannabis dispensaries, delivery services, and doctors in your area." },
  ];
};

export async function loader() {
  // In a real app, this would fetch data from Firebase or another data source
  // For now, we'll use mock data
  const featuredBusinesses = [
    {
      id: "1",
      name: "Green Leaf Dispensary",
      type: "Dispensary",
      imageUrl: "https://images.unsplash.com/photo-1603909223429-69bb7101f94e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.8,
      reviewCount: 124,
      address: "123 Main St",
      city: "Denver",
      state: "CO",
      isPremium: true,
      tags: ["Recreational", "Medical", "Edibles", "Concentrates"],
      description: "A premier dispensary offering a wide range of high-quality cannabis products for both recreational and medical users."
    },
    {
      id: "2",
      name: "Herbal Remedies",
      type: "Dispensary & Delivery",
      imageUrl: "https://images.unsplash.com/photo-1589579234096-07bae35d95a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.6,
      reviewCount: 89,
      address: "456 Oak Ave",
      city: "Boulder",
      state: "CO",
      isPremium: true,
      tags: ["Delivery", "Medical", "CBD", "Topicals"],
      description: "Specializing in medical cannabis with a focus on CBD products and home delivery services."
    },
    {
      id: "3",
      name: "Mountain High",
      type: "Recreational Dispensary",
      imageUrl: "https://images.unsplash.com/photo-1536152470836-b943b246224c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.5,
      reviewCount: 76,
      address: "789 Pine St",
      city: "Colorado Springs",
      state: "CO",
      isPremium: false,
      tags: ["Recreational", "Flower", "Pre-rolls", "Vapes"],
      description: "A recreational dispensary with a wide selection of premium flower, pre-rolls, and vape products."
    }
  ];

  return json({ featuredBusinesses });
}

export default function Index() {
  const { featuredBusinesses } = useLoaderData();
  const domain = useDomain();

  // Update meta tags dynamically based on domain
  meta.title = `${domain.name} | Cannabis Directory for ${domain.state}`;
  meta.description = `Find the best cannabis dispensaries, delivery services, and doctors in ${domain.state}.`;

  return (
    <Layout>
      <HomePage featuredBusinesses={featuredBusinesses} />
    </Layout>
  );
} 