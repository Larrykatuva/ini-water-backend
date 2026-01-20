import { DataSource } from 'typeorm';
import { Country } from '../entities/country.entity';

const countries: Partial<Country>[] = [
  {
    name: 'Kenya',
    code: '254',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg',
  },
];

export const countrySeeder = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Country);

  for (const data of countries) {
    const exists = await repo.findOne({ where: { code: data.code } });
    if (!exists) {
      await repo.save(<Country>{
        name: data.name,
        code: data.code,
        logo: data.logo,
      });
    }
  }

  console.log('Countries seeded successfully.');
};
