# Streamflix

A Netflix-style movie streaming website built with **React** and **TypeScript**. Movie data, posters and trailers come live from the [TMDB API](https://www.themoviedb.org/).

This is a non-commercial college web engineering assignment.

**Live demo:** _add your Vercel link here_

## Features

- Rotating hero banner with big backdrop images and smooth transitions
- Rows of movies by category: Trending, Top rated, Action, Comedy, Horror, Sci-Fi and Animation
- "Top 10 this week" row with ranked numbers
- Search for any movie as you type
- Movie details popup with runtime, genres and a playable YouTube trailer
- "My List" that is saved in the browser
- Animations with Framer Motion: sliding navbar, fade-in rows, hover zoom on cards, spring popup and loading placeholders
- Responsive layout for desktop and mobile

## Tech stack

- [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for development and building
- [Framer Motion](https://www.framer.com/motion/) for animations
- [TMDB API](https://developer.themoviedb.org/) for movie data
- Deployed on [Vercel](https://vercel.com/)

## Getting started

You need [Node.js](https://nodejs.org/) (LTS version) and a free TMDB API key.

1. Clone the repository and install the packages:

   ```bash
   git clone https://github.com/sheerazshyk671/streamflix.git
   cd streamflix
   npm install
   ```

2. Get a free API key from [TMDB](https://www.themoviedb.org/settings/api).

3. Create a file named `.env` in the project's main folder with your key:

   ```
   VITE_TMDB_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Then open the address it prints, usually http://localhost:5173.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the development server         |
| `npm run build`   | Type-checks and builds for production |
| `npm run preview` | Previews the production build locally |

## Project structure

```
src/
  App.tsx   # All components: navbar, hero, rows, cards and movie popup
  App.css   # Styles
  main.tsx  # App entry point
```

## Deployment

The site is deployed on Vercel from this repository. Add `VITE_TMDB_KEY` under the project's Environment Variables in Vercel, then redeploy. Every push to the `main` branch deploys automatically.

## Note about the API key

Variables starting with `VITE_` are included in the built website, so the key is visible to anyone who inspects the deployed site. This is acceptable for a free key on a class project. A production app should keep the key on a backend server instead.

## Credits

This product uses the TMDB API but is not endorsed or certified by [TMDB](https://www.themoviedb.org/). Movie data and images are provided by TMDB.

## Author

_Add your name and roll number here_