/**
 * Enum representing different types of bank accounts
 */
export enum AccountType {
  SAVINGS = 'savings',
  CURRENT = 'current',
  FIXED_DEPOSIT = 'fixed_deposit',
  RECURRING_DEPOSIT = 'recurring_deposit',
  NRI = 'nri',
  SALARY = 'salary'
}

/**
 * Interface for account type display configuration
 */
export interface AccountTypeConfig {
  type: AccountType;
  name: string;
  description: string;
  icon: string;
  minBalance: number;
  interestRate: string;
}

/**
 * Static configuration for all account types
 */
export const ACCOUNT_TYPES: AccountTypeConfig[] = [
  {
    type: AccountType.SAVINGS,
    name: 'Savings Account',
    description: 'Ideal for individuals looking to save money with easy access',
    icon: 'savings',
    minBalance: 1000,
    interestRate: '3.5%'
  },
  {
    type: AccountType.CURRENT,
    name: 'Current Account',
    description: 'For businesses with high volume transactions',
    icon: 'account_balance',
    minBalance: 10000,
    interestRate: '0%'
  },
  {
    type: AccountType.FIXED_DEPOSIT,
    name: 'Fixed Deposit',
    description: 'Lock your money for higher returns',
    icon: 'lock',
    minBalance: 5000,
    interestRate: '6.5%'
  },
  {
    type: AccountType.RECURRING_DEPOSIT,
    name: 'Recurring Deposit',
    description: 'Monthly savings with fixed returns',
    icon: 'autorenew',
    minBalance: 500,
    interestRate: '5.8%'
  },
  {
    type: AccountType.NRI,
    name: 'NRI Account',
    description: 'Special account for Non-Resident Indians',
    icon: 'flight',
    minBalance: 25000,
    interestRate: '4.5%'
  },
  {
    type: AccountType.SALARY,
    name: 'Salary Account',
    description: 'Zero balance account for salaried employees',
    icon: 'payments',
    minBalance: 0,
    interestRate: '3.0%'
  }
];
