import { DataSource } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Provider, ProviderTypes } from '../entities/provider.entity';

const providers: Partial<Provider>[] = [
  {
    type: ProviderTypes.Bank,
    name: 'Absa Bank',
    code: '03',
    swiftCode: 'CBAFKENX',
    payBill: '303030',
    address: 'Westlands Nairobi',
    logo: 'https://play-lh.googleusercontent.com/6_MWt-GdLtPDlJJR92pNzlOrKzUkdbhlEq5zRlpLfqMR0BMNIydJd0b8Tyk_Tc7lgfsN',
  },
  {
    type: ProviderTypes.Bank,
    name: 'NCBA',
    code: '17',
    swiftCode: 'CBAFKENX',
    payBill: '880100',
    address: 'Westlands Nairobi',
    logo: 'https://play-lh.googleusercontent.com/81w7kSItx2G-kPPOwgVwl_6sXO-R3KBWFyTfmRVwHLKRp-4imBFPc1Q7112fZHgrWUv_',
  },
  {
    type: ProviderTypes.Bank,
    name: 'Equity',
    code: '68',
    swiftCode: 'EQBLKENA',
    payBill: '247247',
    address: 'Westlands Nairobi',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ_8ctnfgB9bJBKaFn6JxgKkoqqbdzA4Qm9g&s',
  },
  {
    type: ProviderTypes.Bank,
    name: 'DTB',
    code: '63',
    swiftCode: 'DTKEKENA',
    payBill: '516600',
    address: 'Westlands Nairobi',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAmjfJSBSxmfTH3t1ksYzGrT5O12jrec9oLA&s',
  },
  {
    type: ProviderTypes.Telco,
    name: 'Safaricom Mpesa',
    code: '1001',
    swiftCode: '',
    payBill: '',
    address: 'Westlands Nairobi',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkUm0fCxAYaupkwyaSFOVGU_ZDyrNKHOOPHA&s',
  },
];

export const providersSeeder = async (dataSource: DataSource) => {
  const countryRepository = dataSource.getRepository(Country);
  const providerRepository = dataSource.getRepository(Provider);

  const country = await countryRepository.findOne({ where: { code: '254' } });

  if (country) {
    for (const provider of providers) {
      if (
        !(await providerRepository.findOne({ where: { code: provider.code } }))
      ) {
        await providerRepository.save({
          country: country,
          type: provider.type,
          name: provider.name,
          code: provider.code,
          payBill: provider.payBill,
          address: provider.address,
          swiftCode: provider.swiftCode,
          logo: provider.logo,
        });
      }
    }
  }

  console.log('Providers seeded successfully.');
};
