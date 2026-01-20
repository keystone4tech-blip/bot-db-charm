# Fonts Directory

Place custom font files (.ttf, .otf) here.

## Usage

1. Add font files to this directory
2. Update `app.json` to reference the fonts:

```json
{
  "expo": {
    "fonts": [
      "./src/assets/fonts/CustomFont-Regular.ttf",
      "./src/assets/fonts/CustomFont-Bold.ttf"
    ]
  }
}
```

3. Use fonts in your styles:

```tsx
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
  'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
});

if (!fontsLoaded) return <AppLoading />;

// Then in styles:
fontFamily: 'CustomFont-Regular'
```

## Recommended Fonts

- **Inter** - Great for UI (Google Fonts)
- **Roboto** - Default Android font
- **San Francisco** - Default iOS font (built-in)
- **Montserrat** - Modern, geometric
- **Open Sans** - Clean, readable

## Free Font Resources

- [Google Fonts](https://fonts.google.com/)
- [Font Squirrel](https://www.fontsquirrel.com/)
- [DaFont](https://www.dafont.com/)

## Note

For now, the app uses system fonts (San Francisco on iOS, Roboto on Android), which is fine for most use cases. Custom fonts are optional.
