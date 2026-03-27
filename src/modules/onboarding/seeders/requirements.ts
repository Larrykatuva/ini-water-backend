import { DataSource } from 'typeorm';
import {
  Requirement,
  RequirementInput,
  RequirementType,
} from '../entities/requirement.entity';

const requirements: Partial<Requirement>[] = [
  {
    name: 'Business Formation & Registration',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'a. Choose a Legal Structure\n' +
      '\n' +
      'Sole proprietorship, partnership, or a limited company (recommended for liability protection and scaling).\n' +
      '\n' +
      'Register online via eCitizen – Business Registration Service (BRS).\n' +
      '\n' +
      'You’ll receive a Business Registration Certificate (Certificate of Incorporation for companies).\n' +
      '\n' +
      '**b. Register with Kenya Revenue Authority (KRA)\n' +
      '\n' +
      'Get a KRA PIN for the business.\n' +
      '\n' +
      'Register for taxes like VAT, Corporate Tax / Turnover Tax.\n' +
      '\n' +
      'If bottling, may need excise obligations (excise license & stamps)',
  },
  {
    name: 'County Business Permit',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'Almost every business requires a Single Business Permit from the county government where you will operate.\n' +
      '\n' +
      'It allows commercial operation within that jurisdiction.\n' +
      '\n' +
      'Fees vary by county and business size (approx KSh 5,000 – 30,000+ per year).\n' +
      '\n' +
      'Requirements usually include: business registration docs, location/lease agreement, IDs, and sometimes a site inspection.',
  },
  {
    name: 'Public Health & Hygiene Clearances',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'Because water vending is a public health-sensitive activity:\n' +
      '\n' +
      'a. Public Health Certificate / License\n' +
      '\n' +
      'Issued by county or national health authorities after inspection of premises, water sources, and sanitation systems.\n' +
      '\n' +
      'Costs from a few thousand shillings annually depending on county.\n' +
      '\n' +
      'Often requires medical certificates for all staff handling water.\n' +
      '\n' +
      'b. Health Inspection\n' +
      '\n' +
      'Premises must demonstrate clean conditions (washable floors/walls, safe storage, drainage).\n' +
      '\n' +
      'Staff medical certificates required.',
  },
  {
    name: 'Water Source & WASREB Permits',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'Under Kenya’s Water Act and regulations:\n' +
      '\n' +
      'a. Water Utility / WASREB Approval\n' +
      'If vending water taken from a municipal supply or within a water utility area:\n' +
      '\n' +
      'You must apply for a permit with the licensed water services provider and often sign a water services provisioning agreement.\n' +
      '\n' +
      'You may need to operate at approved locations and sell at approved tariffs.\n' +
      '\n' +
      'b. Water Source Permits (if not municipal)\n' +
      'If using borehole or other raw sources:\n' +
      '\n' +
      'Apply for an abstraction permit from the Water Resources Authority (WRA).\n' +
      '\n' +
      'NEMA approval may be needed if drilling/constructing or conducting activities with environmental impacts.',
  },
  {
    name: 'Kenya Bureau of Standards (KEBS) Certification',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'If you are selling purified or packaged water (refill or bottled):\n' +
      '\n' +
      'a. Standardization Mark & Licenses\n' +
      '\n' +
      'KEBS issues certification showing your water meets national quality standards (e.g., KS ISO/other relevant standards).\n' +
      '\n' +
      'It typically requires inspection of your treatment and vending facilities plus water testing.\n' +
      '\n' +
      'You’ll need to renew annually.\n' +
      '\n' +
      'b. Ongoing Water Testing\n' +
      '\n' +
      'Microbiological and chemical testing is part of maintaining the KEBS mark and public confidence.',
  },
  {
    name: 'Environmental & Safety Compliance',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'Depending on scale and location:\n' +
      '\n' +
      'a. NEMA Approvals\n' +
      '\n' +
      'For construction, borehole drilling, wastewater disposal arrangements, and environmental impact.\n' +
      '\n' +
      'Environmental compliance/licensing certificates may be required.\n' +
      '\n' +
      'b. Safety Requirements\n' +
      '\n' +
      'Fire safety certificates.\n' +
      '\n' +
      'Waste management arrangements.',
  },
  {
    name: 'Taxes & Regulatory Compliance',
    input: RequirementInput.FILE,
    required: true,
    comment:
      'Register with KRA and comply with VAT or Turnover Tax.\n' +
      '\n' +
      'Excise duties may apply (especially for bottled water with excise stamps).\n' +
      '\n' +
      'File returns and renew permits when due.',
  },
];

export const requirementSeeder = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Requirement);

  for (const requirement of requirements) {
    if (!(await repo.findOne({ where: { name: requirement.name } }))) {
      await repo.save(<Requirement>{
        name: requirement.name,
        input: requirement.input,
        required: requirement.required,
        comment: requirement.comment,
        type: RequirementType.ORGANIZATION,
      });
    }
  }

  console.log('Requirements seeded successfully.');
};
