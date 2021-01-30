const form = async (fields, tests) => {
  let hasErrors = false;
  const errors = {};

  for(const field in tests) {
    const fieldTest = tests[field];
    errors[field] = [];

    await fieldTest(
      fields,
      (condition, error) => {
        if(condition) {
          hasErrors = true;
          errors[field].push(error)
        }
      }
    )
  }

  return [hasErrors, errors]
};

module.exports = {
  form
};
