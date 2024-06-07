const form = document.querySelector("[data-form]");
const result = document.querySelector("[data-result]");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const entries = new FormData(event.target);
  const { dividend, divider } = Object.fromEntries(entries);

  // Clear previous results
  result.innerText = '';

  // Validation when values are missing
  if (dividend === '' || divider === '') {
    result.innerText = 'Division not performed. Both values are required in inputs. Try again.';
    return;
  }

  // Validate if inputs are numbers
  const dividendNumber = Number(dividend);
  const dividerNumber = Number(divider);

  if (isNaN(dividendNumber) || isNaN(dividerNumber)) {
    result.innerText = 'Something critical went wrong. Please reload the page.';
    console.error('Invalid input provided. Inputs must be numbers.');
    setTimeout(() => {
      document.body.innerHTML = '<h1>Something critical went wrong. Please reload the page.</h1>';
    }, 0);
    return;
  }

  // Validate if divider is non-negative
  if (dividerNumber <= 0) {
    result.innerText = 'Division not performed. Invalid number provided. Try again.';
    console.error(new Error('Invalid divider provided. Divider must be a positive number.'));
    return;
  }

  // Perform division
  const divisionResult = Math.floor(dividendNumber / dividerNumber);
  result.innerText = divisionResult;
});
