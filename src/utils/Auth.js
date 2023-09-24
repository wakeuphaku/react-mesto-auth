export const register = (email, password) => {
    return fetch('https://auth.nomoreparties.co/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, email })
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            return data;
        })
        .catch((err) => console.log(err));
};

export const login = (email, password) => {
    return fetch('https://auth.nomoreparties.co/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, email })
    })
        .then((response => response.json()))
        .then((data) => {
            if (data.token) {
                localStorage.setItem('jwt', data.token);
                return data;
            }
        })
        .catch(err => console.log(err))
};

export const checkToken = (jwt) => {
    return fetch('https://auth.nomoreparties.co/users/me', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
        }
    })
        .then(res => res.json())
        .then(data => data)
        .catch(err => console.log(err))
}