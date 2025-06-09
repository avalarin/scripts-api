export const parseDateFromString = (input: string): Date => {
  const date = new Date(input);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD.');
  }

  return date;
};
