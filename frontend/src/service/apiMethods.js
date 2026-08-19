export const get = async (url) => {
  const response = await fetch(url, {
    credentials: 'include',
  });
  return response.json();
};

export const post = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

export const put = async (url, body) => {
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

export const del = async (url) => {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
};

