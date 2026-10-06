# Contributing

Thank you for considering a contribution to Valorant Analyst. This project
is built on a few principles, and most decisions follow from them. Read the
[design principles](README.md#design-principles) before proposing a change.

## Before you start

- Read [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for setup and the checks
  to run before committing.
- Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) if your change crosses
  the backend and frontend.
- For a larger change, open an issue first to discuss the approach. This
  avoids spending effort on a direction that does not fit the project.

## Making a change

1. Create a branch from `main` with a descriptive name, such as
   `feature/map-gallery` or `fix/palette-focus`.
2. Make the change in small, focused commits. Keep unrelated changes apart.
3. Run the checks in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#checks-before-committing).
4. Update the documentation the change affects: the README, the relevant
   guide in `docs/`, and `CHANGELOG.md`.
5. Open a pull request. Describe what changed, why, and how you checked it.

## Standards

- **Data integrity.** A statistic must come from stored data, or the feature
  must say that the data is missing. Do not add estimates, placeholder values,
  or invented examples to the interface or the documentation.
- **Labelled projections.** Anything hypothetical must be labelled as such.
- **Accessibility.** Controls keep a minimum touch target of 36 pixels.
  Keyboard users must be able to reach every action that mouse users can. Motion
  respects the reduced-motion setting.
- **Assets.** Do not add images that you do not have the right to distribute.
  Agent and map art in the repository is original illustration. Confirm rights
  before adding third-party or game-derived artwork.
- **Copy.** Use plain hyphens and colons in visible text. Avoid en and em
  dashes.

## Reporting problems

Open an issue with the steps to reproduce, what you expected, and what
happened. Include the page or endpoint, the browser or Python version, and any
console or server error messages.

## Licence

By contributing, you agree that your contribution is licensed under the MIT
licence in [`LICENSE`](LICENSE).
