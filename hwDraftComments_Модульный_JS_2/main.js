import { getComments} from "./api.js";
import { currentDate, delay } from "./assistants.js";
import { answerComment, initEventListeners } from "./eventListeners.js";
import { setComments, renderCommentators, сommentators } from "./renderCommentators.js";
import { renderLogin } from "./renderLogin.js";

const addForm = document.getElementById("form");
const loader = document.querySelector(".loader");

function getCom() {
  getComments().then((responseData) => {
    let appComments = responseData.comments.map((comment) => {
      return {
        name: comment.author.name,
        date: currentDate(comment.date),
        comment: comment.text,
        likes: comment.likes,
        isLiked: comment.isLiked,
      };
    });

   setComments(appComments);
   renderCommentators({сommentators, initEventListeners, answerComment, delay});
  //  loader.textContent = '';
  //  addForm.classList.remove("hidden");
   preloader.classList.add('preloader-hidden');

  })
};
getCom();

renderLogin({getComments});

initEventListeners ({сommentators}, {renderCommentators});

answerComment (сommentators);

console.log("It works!");

 