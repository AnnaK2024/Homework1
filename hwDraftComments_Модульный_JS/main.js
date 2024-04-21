
"use strict";

window.onload = function() {
  let preloader = document.getElementById('preloader');
};

const listElement = document.getElementById ('list');
const nameElement = document.getElementById ('name-input');
const textElement = document.getElementById ('text-input');
const buttonElement = document.getElementById ('add-button');
const addForm = document.getElementById("form");
const loader = document.querySelector(".loader");

let сommentators = [];

const getComments = () => {
  return fetch("https://wedev-api.sky.pro/api/v1/:anna-kalina/comments", {
   method: "GET" 
  })
    .then((response) => {
      if (response.status === 500) {
        throw new Error("Сервер упал");
      }

      if (response.status === "Failed to fetch") {
        throw new Error("Кажется что-то пошло не так, попробуй позже..");
      }
      return response.json();
    })
    .then((responseData) => {
      const appComments = responseData.comments.map((comment) => {
        return {
          name : comment.author.name,
          date : new Date(comment.date).toLocaleDateString('ru-RU', { year: '2-digit', month: '2-digit', day: '2-digit' }) + ' ' + new Date(comment.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          comment : comment.text,
          likes : comment.likes,
          isLiked: comment.isLiked,
        };
      });

      сommentators = appComments;
      renderCommentators();
      loader.textContent = '';
      addForm.classList.remove("hidden");
      preloader.classList.add('preloader-hidden');
    })
    .catch((error) => {
       
       if (error.message === "Сервер упал") {
         alert("Нет интернета");
       }
       if (error.message === "Failed to fetch") {
         alert("Кажется что-то пошло не так, попробуй позже..");
       }
    });   
};
getComments();

const renderCommentators = () => {
  const commentatorsHtml = сommentators.map((сommentator, index) => {
    return `<li class="comment" data-index="${index}">
      <div class="comment-header">
       <div>${сommentator.name}</div>
       <div>${сommentator.date}</div>
      </div>
      <div class="comment-body">
       <div class="${сommentator.isEdit ? 'display-none' : 'comment-text'}">${sanitizeHtml(сommentator.comment)}</div>
       <textarea type="textarea" class="${сommentator.isEdit ? 'add-form-text' : 'display-none'}" >${сommentator.comment}</textarea>
      </div>
      <div class="comment-footer">
        <button class="${сommentator.isEdit ? 'edit-button' : 'save-button'}" data-index="${index}">Редактировать</button>
        <button class="${сommentator.isEdit ? 'save-button' : 'textarea'}" data-index="${index}">Сохранить</button>
      <div class="likes">
        <span class="likes-counter">${сommentator.likes}</span>
        <button data-like="${сommentator.likes}" data-index="${index}" class="like-button ${сommentators[index].isLiked ?'-active-like' : 'like-button'}"></button>
      </div>
    </div>
    </li>`;
  })
  .join("");

  listElement.innerHTML = commentatorsHtml;
  
  initEventListeners();
  editEventListeners();
  answerComment();
};
getComments();

function answerComment () {
  
  const commentsElements = document.querySelectorAll('.comment');

  for (const commentsEl of commentsElements) { 

    commentsEl.addEventListener('click', (e) => {
      e.stopPropagation();

      const index = commentsEl .dataset.index;
    
      textElement.value = `QUOTE_BEGIN${сommentators[index].comment}\n${сommentators[index].name}QUOTE_END`;

      renderCommentators();

    })
  }
};

const editEventListeners = () => { 
  const editButtonElements = document.querySelectorAll(".edit-button"); 
  for ( const editButtonEl of editButtonElements) { 
    editButtonEl.addEventListener("click", (e) => { 
      e.stopPropagation();
      const index = editButtonEl.dataset.index;
      сommentators[index].isEdit = !сommentators[index].isEdit;
      renderCommentators();
    });
  }

  const saveButtons = document.querySelectorAll(".save-button");
  for (const saveButton of saveButtons) {
    saveButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = saveButton.dataset.index;
      сommentators[index].isEdit = !сommentators[index].isEdit;
      сommentators[index].comment = saveButton.closest('.comment').querySelector('textarea').value
      renderCommentators();
    });
  }
}

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}   

const initEventListeners = () => {
  const likeButtonElement = document.querySelectorAll(".like-button");
  for ( const likeButtonEl of likeButtonElement) {

    const index = likeButtonEl.dataset.index;
    const counter = likeButtonEl.dataset.like;

    likeButtonEl.addEventListener("click", (event) => {
      event.stopPropagation();

      likeButtonEl.classList.add("-loading-like");

      delay(2000).then(() => {

        if (сommentators[index].isLiked === false) {

          const result = Number(counter) + 1;

          сommentators[index].likes = result;
          сommentators[index].isLiked = true;

        } else if (сommentators[index].isLiked === true) {

          const result = Number(counter) - 1;

          сommentators[index].likes = result;
          сommentators[index].isLiked = false;
        }

        renderCommentators();
      })  
    })
  }
}
renderCommentators();


buttonElement.addEventListener("click", () => {
  nameElement.classList.remove("error");
  textElement.classList.remove("error");
  
  if (nameElement.value.trim() === "") {
    nameElement.classList.add("error");
    return;
  }  
  if (textElement.value.trim() === "") {
    textElement.classList.add("error");
    return;
  };

 const currentDate = new Date();
  function formatTime(currentDate){

   const date = currentDate.getDate().toString().padStart(2, "0");
   const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
   const year = currentDate.getFullYear().toString().substr(2,2);

   const h = currentDate.getHours().toString().padStart(2, "0");
   const m = currentDate.getMinutes().toString().padStart(2, "0");

   return `${date}.${month}.${year} ${h}:${m}`
  }; 


  addForm.classList.add("hidden");
  loader.textContent = 'Комментарий добавляется .....';

  fetch("https://wedev-api.sky.pro/api/v1/:anna-kalina/comments", {
    method: "POST",
    body: JSON.stringify ({
      name: (nameElement.value),
      text: (textElement.value),
      forceError: true,
    }),
  })
    .then((response) => {
      if (response.status === 500) {
        // handlePostClick();
        throw new Error("Сервер упал");
      }

      if (response.status === 400) {
        throw new Error("Вводимые данные слишком короткие");
      }  
      
       return response.json();
    })  
    .then(() => {
      nameElement.value = "";
      textElement.value = "";
      return getComments();
    })
    .catch((error) => {
       
      if (error.message === "Сервер упал") {
        alert("Нет интернета");

      }
      if (error.message === "Вводимые данные слишком короткие") {
        alert("Имя или тект менее трех символов");

      }
      if (error.message === "Failed to fetch") {
        alert("Кажется что-то пошло не так, попробуй позже..");
      }
      
      console.warn(error);
      loader.textContent = '';
      addForm.classList.remove("hidden");
    });

    renderCommentators();

//  const handlePostClick = () => {

//   postComment(text.value, name.value)
//    .catch((error) => {

//      if (error.message === 500) {

//        handlePostClick();
//      }

//     });

//   };

});
renderCommentators();

const sanitizeHtml = (htmlString) => {
  return htmlString
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("QUOTE_BEGIN", "<div class='quote'>")
  .replaceAll("QUOTE_END", "</div>")
};

const formElement = document.getElementById ('form');
 formElement.addEventListener('keyup', keyEvent);
  function keyEvent(e) {
    if (e.code === 'Enter') {
     buttonElement.dispatchEvent(new Event('click'));
    }
  };
 
const removeButton = document.getElementById("deleteComment");
removeButton.addEventListener("click", () => {
  сommentators.pop();
  renderCommentators();
});

console.log("It works!");

