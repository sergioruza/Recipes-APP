import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from 'react';
import clipboardCopy from 'clipboard-copy';
import { Button, Checkbox, Divider, FormControlLabel,
  Typography, Stack } from '@mui/material';
import { fetchDetais, fetchGetTypeInvert, setLocalStorage,
  getLocalStorage } from '../services/APIfetch';
import MyContext from '../context/MyContext';
import RecommendationCard from '../components/RecommendationCard';
import './RecipesDetails.css';
import shareIcon from '../images/shareIcon.svg';
import whiteHeartIcon from '../images/whiteHeartIcon.svg';
import blackHeartIcon from '../images/blackHeartIcon.svg';
import '../App.css';

export default function RecipeInProgress({ history }) {
  const [recipe, setRecipe] = useState({});
  const [trueFalse, setTrue] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [isRecipeDone, setIsRecipeDone] = useState(false);
  const [recipeId, setRecipeId] = useState('');
  const [isInProgress, setIsInProgress] = useState(false);
  const [isCliped, setIsCliped] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [checked, setChecked] = useState([]);
  const { setApiForType } = useContext(MyContext);
  const filtFunc = (meals) => {
    const filteredIngredients = Object.entries(meals)
      .filter((e) => e[0].includes('strIngredient'))
      .filter((e) => e[1] !== '' && e[1] !== null);
    const filteredMeasures = Object.entries(meals)
      .filter((e) => e[0].includes('strMeasure'));
    setIngredients(filteredIngredients);
    setMeasures(filteredMeasures);
    setTrue(true);
  };
  const type = history.location.pathname.split('/')[1];
  const idRecipe = pathname.split('/')[2];
  const recipeKey = type === 'meals' ? 'idMeal' : 'idDrink';
  useEffect(() => {
    const getRecipe = async () => {
      const response = await fetchDetais(idRecipe, type);
      setRecipe(response[0]);
      filtFunc(response[0]);
      setRecipeId(response[0][recipeKey]);
    };
    const response = async () => setApiForType(await fetchGetTypeInvert(type));
    response();
    getRecipe();
  }, [history.location.pathname, setApiForType, idRecipe, recipeKey, type]);
  useEffect(() => {
    const doneRecipes = getLocalStorage('doneRecipes', []);
    const inProgressRecipes = getLocalStorage('inProgressRecipes', {
      drinks: {}, meals: {},
    });
    const array = inProgressRecipes[type][recipeId];
    setChecked(array || []);
    const isProgress = inProgressRecipes[type];
    const isDone = doneRecipes.some((e) => e.id === recipeId);
    setIsInProgress(Object.keys(isProgress).includes(recipeId));
    setIsRecipeDone(isDone);
  }, [isInProgress, recipe, recipeId, type]);
  useEffect(() => {
    const favoriteRecipes = localStorage.getItem('favoriteRecipes')
      ? JSON.parse(localStorage.getItem('favoriteRecipes')) : [];
    const isRecipeFavorited = favoriteRecipes.some((e) => e.id === recipeId);
    setIsFavorited(isRecipeFavorited);
  }, [recipeId]);
  const handleShare = () => {
    clipboardCopy(`http://localhost:3000/${type}/${recipeId}`);
    setIsCliped(true);
  };
  const handleIngredientClick = (i) => {
    let markedIngredients = [];
    if (checked.includes(i[1])) {
      markedIngredients = checked.filter((e) => e !== i[1]);
    } else {
      markedIngredients = [...checked, i[1]];
    }
    setChecked(markedIngredients);
    const actualInProgress = getLocalStorage('inProgressRecipes', {
      drinks: {}, meals: {},
    });
    const newInProgress = {
      ...actualInProgress,
      [type]: {
        ...actualInProgress[type],
        [recipeId]: markedIngredients,
      },
    };
    setLocalStorage('inProgressRecipes', newInProgress);
  };
  const handleFavoriteBtn = () => {
    const favoriteRecipes = getLocalStorage('favoriteRecipes', []);
    const newFavoriteRecipes = [...favoriteRecipes, {
      id: recipe[recipeKey],
      type: type === 'meals' ? 'meal' : 'drink',
      nationality: recipe.strArea || '',
      category: recipe.strCategory || '',
      alcoholicOrNot: recipe.strAlcoholic || '',
      name: recipe.strDrink || recipe.strMeal,
      image: recipe.strDrinkThumb || recipe.strMealThumb,
    }];
    if (!isFavorited) {
      setLocalStorage('favoriteRecipes', newFavoriteRecipes);
      setIsFavorited(true);
    } else {
      const newFavorited = getLocalStorage('favoriteRecipes', [])
        .filter((e) => e.id !== recipeId);
      setLocalStorage('favoriteRecipes', newFavorited);
      setIsFavorited(false);
    }
  };
  const handleFinishbtn = () => {
    const date = new Date();
    const doneRecipes = getLocalStorage('doneRecipes', []);
    const newDoneRecipes = [...doneRecipes, {
      id: recipe[recipeKey],
      type: type === 'meals' ? 'meal' : 'drink',
      nationality: recipe.strArea || '',
      category: recipe.strCategory || '',
      alcoholicOrNot: recipe.strAlcoholic || '',
      name: recipe.strDrink || recipe.strMeal,
      image: recipe.strDrinkThumb || recipe.strMealThumb,
      doneDate: date,
      tags: recipe.strTags ? recipe.strTags
        .split(',') : [],
    }];
    setLocalStorage('doneRecipes', newDoneRecipes);
    history.push('/done-recipes');
  };
  return (
    <div>
      <Stack direction="row" justifyContent="space-around" alignItems="center">
        <Typography
          variant="h4"
          data-testid="recipe-in-progress"
        >
          Recipe in Progress
        </Typography>
        <Stack direction="row" spacing={ 2 }>
          <Button
            variant="contained"
            type="button"
            onClick={ handleShare }
            data-testid="share-btn"
          >
            <img src={ shareIcon } alt="share-link" />
          </Button>
          {isCliped && 'Link copied!'}
          <Button
            variant="contained"
            type="button"
            onClick={ handleFavoriteBtn }
          >
            <img
              data-testid="favorite-btn"
              src={ isFavorited ? blackHeartIcon : whiteHeartIcon }
              alt="favorite-link"
            />
          </Button>
        </Stack>
      </Stack>
      {
        trueFalse
         && (
           <div>
             <img
               data-testid="recipe-photo"
               width="250px"
               src={ recipe.strMealThumb || recipe.strDrinkThumb }
               alt={ recipe.strMeal || recipe.strDrink }
             />
             <Typography
               variant="h3"
               data-testid="recipe-title"
             >
               { recipe.strMeal || recipe.strDrink }
             </Typography>
             <Typography
               variant="h5"
               data-testid="recipe-category"
             >
               {recipe.strAlcoholic || recipe.strCategory }
             </Typography>
             <Divider />
             <Typography
               variant="p"
               data-testid="instructions"
             >
               {recipe.strInstructions}
             </Typography>
             <Divider />
             <ul>
               { ingredients.map((i, index) => {
                 const isChecked = checked.some((e) => e === i[1]);
                 return (
                   <Stack key={ i[1] }>
                     <FormControlLabel
                       htmlFor="ingredient"
                       data-testid={ `${index}-ingredient-step` }
                       className={ isChecked === true
                         ? 'finished'
                         : 'unfinished' }
                       label={ `${i[1]} ${measures[index][1] || ''}` }
                       control={
                         <Checkbox
                           type="checkbox"
                           checked={ isChecked }
                           name="ingredient"
                           onClick={ () => handleIngredientClick(i) }
                         />
                       }
                     />
                   </Stack>
                 );
               })}
             </ul>
             {type === 'meals' && (
               <iframe
                 title={ recipe.strMeal || recipe.strDrink }
                 data-testid="video"
                 width="350"
                 height="300"
                 src={ `https://www.youtube.com/embed/${recipe.strYoutube.split('watch?v=')[1]}` }
               />
             )}
           </div>
         )
      }
      { !isRecipeDone && (
        <Button
          variant="contained"
          className="startRecipe"
          type="button"
          data-testid="finish-recipe-btn"
          disabled={ checked.length !== ingredients.length }
          onClick={ handleFinishbtn }
        >
          Finish
        </Button>
      )}
      <div className="scrolling">
        <RecommendationCard type={ history.location.pathname.split('/')[1] } />
      </div>
    </div>
  );
}
RecipeInProgress.propTypes = { history: PropTypes.shape }.isRequired;
