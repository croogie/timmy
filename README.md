# Timmy

Widget [Übersicht](https://tracesof.net/uebersicht/) przedstawiający dzienny plan jako pionowy wykres czasu. Pobiera dzisiejsze wydarzenia z Google Calendar przez [`gcalcli`](https://github.com/insanum/gcalcli), układa nakładające się spotkania w kolumnach i zaznacza bieżącą godzinę.

## Działanie

- Pobiera wyłącznie wydarzenia z bieżącego dnia; odrzucone zaproszenia są pomijane.
- Odświeża dane kalendarza po uruchomieniu oraz co 10 minut.
- Aktualizuje zegar i pozycję wskaźnika „teraz” co minutę.
- Domyślnie pokazuje 2 godziny przed obecną godziną i 4 godziny po niej. Zakres nie wykracza poza granice dnia.
- Rozmieszcza równoległe wydarzenia w maksymalnie trzech kolumnach; wydarzenia wykorzystują wolne sąsiednie kolumny, gdy nie kolidują czasowo.
- Wyróżnia trwające wydarzenie grubszą ramką, a zakończone rysuje na szaro.
- Po najechaniu na pionowy pasek wydarzenia jego etykieta śledzi kursor w pionie i wyświetla się o szerokość paska po jego lewej stronie.
- Etykiety godzin mają zaokrąglone tło: białe dla zwykłych ticków i żółte dla bieżącej godziny; tekst jest czarny.

### Sterowanie

| Akcja | Efekt |
| --- | --- |
| Przewijanie w górę / w dół nad wykresem | Przesuwa widoczny przedział o 10 minut wstecz / naprzód. |
| Dwuklik | Przywraca przedział wyśrodkowany wokół bieżącej godziny. |

## Wymagania

- macOS i uruchomiona aplikacja Übersicht.
- Skonfigurowane `gcalcli` z dostępem do kalendarzy Google. Widget wywołuje `gcalcli agenda` dla dzisiejszego dnia z opcjami `--tsv --nodeclined --details calendar`.
- Plik wykonywalny `gcalcli` pod ścieżką `/opt/homebrew/bin/gcalcli`. Przy innej instalacji zmień ścieżkę w `lib/gcal.js`.
- Node.js 8 do instalacji zależności deweloperskich — wersję wskazuje `.nvmrc`.

## Instalacja

1. Pobierz ten katalog i zainstaluj zależności:

   ```sh
   npm install
   ```

2. W Übersicht wybierz **Open Widgets Folder**. Domyślnie otwiera on katalog:

   ```text
   ~/Library/Application Support/Übersicht/widgets/
   ```

3. Skopiuj katalog projektu do tego katalogu i nadaj mu nazwę kończącą się na `.widget`, np. `timmy.widget`.
4. Upewnij się, że `gcalcli` działa dla konta Google, a następnie przeładuj widget w Übersicht. Aplikacja obserwuje katalog widgetów i powinna wykryć zmianę automatycznie.

> Widget uruchamia lokalne polecenie `gcalcli`; instaluj tylko kod, któremu ufasz, i sprawdź konfigurację dostępu do kalendarza.

## Konfiguracja

Podstawowe ustawienia znajdują się w `lib/settings.js`:

- `timeBefore` i `timeAfter` — liczba godzin widocznych odpowiednio przed i po bieżącej godzinie.
- `defaultEventColor` — kolor wydarzenia, którego kalendarz nie ma własnego wpisu.
- `calendarColors` — mapa nazw kalendarzy zwracanych przez `gcalcli` na kolory CSS. Klucz musi dokładnie odpowiadać nazwie kalendarza.
- `className` — pozycja i wygląd kontenera widgetu; domyślnie ma szerokość 350 px i jest przypięty do lewej krawędzi ekranu.

Przykład dodania koloru kalendarza:

```js
calendarColors: {
  "Mój kalendarz": "#4caf50",
}
```

## Struktura

| Ścieżka | Odpowiedzialność |
| --- | --- |
| `index.jsx` | Punkt wejścia widgetu i obsługa błędu renderowania. |
| `lib/gcal.js` | Wywołanie `gcalcli` oraz parsowanie danych TSV do wydarzeń. |
| `lib/calendar-events-layout.js` | Walidacja i układ nakładających się wydarzeń. |
| `lib/components/chart.jsx` | SVG, bieżący czas, przewijanie i kompozycja wykresu. |
| `lib/components/axis.jsx` | Oś godzin i linie siatki. |
| `lib/components/eventsList.jsx` | Pobieranie danych oraz renderowanie bloków wydarzeń. |
| `lib/time-window.js` | Wyznaczanie i ograniczanie widocznego przedziału czasu. |

## Testy

```sh
npm test
```

Testy sprawdzają wyznaczanie przedziału czasu, w tym ograniczenie zakresu na początku i końcu dnia oraz przesunięcie widoku.

## Diagnostyka

- Brak wydarzeń: uruchom `gcalcli` ręcznie dla bieżącego dnia i sprawdź autoryzację oraz nazwy kalendarzy.
- Błąd uruchomienia `gcalcli`: sprawdź ścieżkę w `lib/gcal.js`; jest ustawiona dla Homebrew na Apple Silicon.
- Nieprawidłowe kolory: porównaj klucze `calendarColors` z nazwą kalendarza zwracaną w kolumnie `calendar` przez `gcalcli`.
- Podczas działania Übersicht można obejrzeć widget pod adresem `http://127.0.0.1:41416/`; element widgetu ma identyfikator `timmy-index-jsx`.
