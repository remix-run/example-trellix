import { type Company } from "../../fake-data";

export function groupCompanies(companies: Company[], field: keyof Company) {
  return companies.reduce((acc, company) => {
    const key = company[field];
    const current = acc[key] || [];
    return { ...acc, [key]: [...current, company] };
  }, {} as Record<string, Company[]>);
}

export function sortByStatusOrder(order: string[]) {
  return (a: string, b: string) => {
    let indexA = order.indexOf(a);
    let indexB = order.indexOf(b);

    // If a is not in order array, set its index to be larger than the length of the order array
    if (indexA === -1) indexA = order.length;

    // If b is not in order array, set its index to be larger than the length of the order array
    if (indexB === -1) indexB = order.length;

    return indexA - indexB;
  };
}
