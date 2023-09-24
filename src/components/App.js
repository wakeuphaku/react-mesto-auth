import React from "react";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom';

import { Header } from "./Header.js";
import Main from "./Main.js";
import { Footer } from "./Footer.js";
import { PopupWithForm } from "./PopupWithForm.js";
import { ImagePopup } from "./ImagePopup.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext"
import { api } from "../utils/Api.js";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup"
import AddPlacePopup from "./AddPlacePopup.js";
import { Register } from "./Register.js";
import { Login } from "./Login.js";
import { checkToken } from '../utils/Auth.js';
import ProtectedRoute from "./ProtectedRoute.js";

import InfoTooltip from './InfoTooltip.js'

function App() {

  const [cards, setCards] = React.useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(null)
  const [currentUser, setCurrentUser] = React.useState({})
  const [isLogin, setIsLogin] = React.useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    api
      .getCards()
      .then(item => {
        setCards(item);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  React.useEffect(() => {
    api.getUserInfo()
      .then(item => {
        setCurrentUser(item);
      })
      .catch(err => {
        console.log(err);
      })
  }, [])


  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLikeCardStatus(card._id, isLiked)
      .then((item) => {
        setCards((state) => { return state.map((c) => c._id === card._id ? item : c) });

      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleAddPlaceSubmit(card) {
    api.createCard(card)
      .then(newCard => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleUpdateAvatar(avatar) {

    api.changeAvatar(avatar)
      .then(item => {
        setCurrentUser(item);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleCardDelete(card) {

    api.deleteCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((item) => item._id !== card._id));
      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleCardClick(card) {
    setSelectedCard(card)
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }


  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleUpdateUser(data) {
    api.editProfile(data.name, data.about)
      .then((item) => {
        setCurrentUser(item);
        closeAllPopups();
      }).catch(err => {
        console.log(err);
      })
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null)
    setIsInfoTooltipOpen(false)
  }
  const handleLogin = () => {
    setIsLogin(true);
    handleСheckToken()
  };
  const handleLogout = () => {
    setIsLogin(false);
  };

  const handleInfoTooltipClick = (isSuccess) => {
    setIsInfoTooltipOpen(true);
    setIsSuccess(isSuccess);
  };


  React.useEffect(() => {
    handleСheckToken();
  }, []);

  const handleСheckToken = () => {
    if (localStorage.getItem("jwt")) {
      const jwt = localStorage.getItem("jwt");
      checkToken(jwt)
        .then((item) => {
          if (item) {
            setUserEmail(item.data.email);
            setIsLogin(true);

          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };



  return (
    <CurrentUserContext.Provider value={currentUser}>

      <div className="page">

        <BrowserRouter>
          <Header
            isLogin={isLogin}
            handleLogout={handleLogout}
            userEmail={userEmail}
          />
          <Routes>

            <Route
              path="profile"
              element={
                isLogin ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/sign-up" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={Main}
                  isLogin={isLogin}
                  cards={cards}
                  onEditProfile={handleEditProfileClick}
                  onEditAvatar={handleEditAvatarClick}
                  onAddPlace={handleAddPlaceClick}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                />
              }
            />
            <Route
              path="/sign-up"
              element={
                <Register handleInfoTooltipClick={handleInfoTooltipClick} />
              }
            />
            <Route
              path="/sign-in"
              element={<Login handleLogin={handleLogin} handleInfoTooltipClick={handleInfoTooltipClick} />}
            />
          </Routes>
        </BrowserRouter>

        {/* <Main
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onEditAvatar={handleEditAvatarClick}
            onAddPlace={handleAddPlaceClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}

          /> */}

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />

        <InfoTooltip
          success={isSuccess}
          onClose={closeAllPopups}
          isOpen={isInfoTooltipOpen}

        />

        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups}>
        </ImagePopup>

        <PopupWithForm
          name="confirm"
          title="Вы уверены?"
        ></PopupWithForm>

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        ></EditAvatarPopup>

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        >

        </AddPlacePopup>
        <Footer />

      </div >


    </CurrentUserContext.Provider >
  );
}

export default App;
