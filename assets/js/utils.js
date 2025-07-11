// Fetch JSON data from a given path
async function fetchData(path) {
  const resp = await fetch(path);
  return resp.json();
}
