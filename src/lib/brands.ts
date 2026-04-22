export type Brand = {
  name: string;
  logoPath: string;
};

export const BRANDS: Brand[] = [
  { name: "Audi", logoPath: "/brands/audi.svg" },
  { name: "BMW", logoPath: "/brands/bmw.svg" },
  { name: "Citroën", logoPath: "/brands/citroen.svg" },
  { name: "Fiat", logoPath: "/brands/fiat.svg" },
  { name: "Ford", logoPath: "/brands/ford.svg" },
  { name: "Honda", logoPath: "/brands/honda.svg" },
  { name: "Hyundai", logoPath: "/brands/hyundai.svg" },
  { name: "Kia", logoPath: "/brands/kia.svg" },
  { name: "Mazda", logoPath: "/brands/mazda.svg" },
  { name: "Mercedes-Benz", logoPath: "/brands/mercedes-benz.svg" },
  { name: "Nissan", logoPath: "/brands/nissan.svg" },
  { name: "Opel", logoPath: "/brands/opel.svg" },
  { name: "Peugeot", logoPath: "/brands/peugeot.svg" },
  { name: "Renault", logoPath: "/brands/renault.svg" },
  { name: "SEAT", logoPath: "/brands/seat.svg" },
  { name: "Škoda", logoPath: "/brands/skoda.svg" },
  { name: "Suzuki", logoPath: "/brands/suzuki.svg" },
  { name: "Toyota", logoPath: "/brands/toyota.svg" },
  { name: "Volkswagen", logoPath: "/brands/volkswagen.svg" },
  { name: "Volvo", logoPath: "/brands/volvo.svg" },
] as const;
