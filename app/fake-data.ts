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
  order: number;
};

let companies: Array<Company> = [];

let statusOrders = new Map<string, number>();

for (let i = 0; i < 30; i++) {
  let status: Company["status"] =
    Math.random() > 0.5 ? "New" : Math.random() > 0.5 ? "Active" : "Inactive";

  let order = statusOrders.get(status) || 0;
  statusOrders.set(status, order + 1);

  companies.push({
    id: faker.string.uuid(),
    name: faker.company.name(),
    city: faker.location.city(),
    state: faker.location.state(),
    phone: faker.phone.number(),
    contact: faker.person.fullName(),
    email: faker.internet.email(),
    status,
    order,
  });
}

export async function getCompanies() {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  return companies;
}
