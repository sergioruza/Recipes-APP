import PropTypes from 'prop-types';
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DisplayRecipe from '../components/DisplayRecipe';
import CardRecipes from '../components/CardRecipes';
import TagsForFilters from '../components/TagsForFilters';

function Recipes({ history }) {
  return (
    <div>
      <Header history={ history } />
      <TagsForFilters history={ history } />
      <DisplayRecipe history={ history } />
      <CardRecipes history={ history } />
      <Footer />
    </div>
  );
}

Recipes.propTypes = {
  history: PropTypes.shape.isRequired,
};

export default Recipes;
