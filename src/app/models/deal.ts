export class Deal {
  name: string = '';
  summary: string = '';
  postedToType: string = '';
  postedToKey: string = '';

  stageKey: string = '';
  status: string = '';
  ownerKey: string = '';

  onboardingAmount: number = 1000;
  monthlyAmount: number = 100;
  probability: number = 0;

  isOnboarded = false;
  isInitialDevelopment = false;
  isReview = false;
  isRevise = false;
  isLaunch = false;

  expectedClose: Date = new Date();

  addOns = []; // [{name: '', price: ''}'

  dateAdded: Date = new Date();
  dateUpdated: Date = new Date();
  dateClosed: Date;
};
