
export function getErrors(err, defaultErrorMessage = 'An error occurred.') {
  // Return an array of errors that the server sent back. If no error data was provided, then
  // return an array with a default error.
  if (err.data && err.data.errors) {
    return err.data.errors;
  } else {
    return [{ message: defaultErrorMessage }];
  }
}
