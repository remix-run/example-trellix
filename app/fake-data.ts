import { faker } from "@faker-js/faker";

export type Company = {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  contact: string;
  email: string;
  status: "New" | "Active" | "Inactive";
};

let companies: Array<Company> = [];

for (let i = 0; i < 30; i++) {
  companies.push({
    id: faker.string.uuid(),
    name: faker.company.name(),
    city: faker.location.city(),
    state: faker.location.state(),
    phone: faker.phone.number(),
    contact: faker.person.fullName(),
    email: faker.internet.email(),
    status:
      Math.random() > 0.5 ? "New" : Math.random() > 0.5 ? "Active" : "Inactive",
  });
}

export async function getCompanies() {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  return companies;
}
