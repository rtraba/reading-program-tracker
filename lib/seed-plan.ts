type SeedBook = {
  position: number;
  title: string;
  author: string;
  start_date: string;
  end_date: string;
  style: string | null;
  intensity: number | null;
  difficulty: number | null;
};

type SeedPhase = {
  position: number;
  name: string;
  objective: string;
  start_date: string;
  end_date: string;
  books: SeedBook[];
};

export const seedProgram = {
  title: "Plan anual de lectura filosofica y psicologica",
  description:
    "Programa precargado desde el plan corregido. Permite seguimiento flexible con alertas de desvio.",
  start_date: "2026-03-26",
  end_date: "2026-12-31",
};

export const seedPhases: SeedPhase[] = [
  {
    position: 1,
    name: "Fase 1 - Base personal",
    objective: "Ordenar marco interno y percepcion",
    start_date: "2026-03-26",
    end_date: "2026-06-07",
    books: [
      {
        position: 1,
        title: "Meditaciones",
        author: "Marco Aurelio",
        start_date: "2026-03-26",
        end_date: "2026-04-15",
        style: "fragmentaria",
        intensity: 2,
        difficulty: 3,
      },
      {
        position: 2,
        title: "El mito de Sisifo",
        author: "Albert Camus",
        start_date: "2026-04-16",
        end_date: "2026-05-13",
        style: "reflexiva_lenta",
        intensity: 4,
        difficulty: 4,
      },
      {
        position: 3,
        title: "The Elephant in the Brain",
        author: "Simler & Hanson",
        start_date: "2026-05-14",
        end_date: "2026-06-07",
        style: "media",
        intensity: 3,
        difficulty: 3,
      },
    ],
  },
  {
    position: 2,
    name: "Fase 2 - Trabajo y alienacion",
    objective: "Entender relacion con el trabajo",
    start_date: "2026-06-08",
    end_date: "2026-08-28",
    books: [
      {
        position: 4,
        title: "Manuscritos economico-filosoficos",
        author: "Karl Marx",
        start_date: "2026-06-08",
        end_date: "2026-07-13",
        style: "reflexiva_lenta",
        intensity: 5,
        difficulty: 5,
      },
      {
        position: 5,
        title: "Bullshit Jobs",
        author: "David Graeber",
        start_date: "2026-07-14",
        end_date: "2026-08-02",
        style: "fluida",
        intensity: 2,
        difficulty: 2,
      },
      {
        position: 6,
        title: "Shop Class as Soulcraft",
        author: "Matthew Crawford",
        start_date: "2026-08-03",
        end_date: "2026-08-28",
        style: "media",
        intensity: 3,
        difficulty: 3,
      },
    ],
  },
  {
    position: 3,
    name: "Fase 3 - Balance vital",
    objective: "Evitar dogmatismos y equilibrar",
    start_date: "2026-08-29",
    end_date: "2026-10-24",
    books: [
      {
        position: 7,
        title: "Carta a Meneceo",
        author: "Epicuro",
        start_date: "2026-08-29",
        end_date: "2026-08-31",
        style: "fragmentaria",
        intensity: null,
        difficulty: null,
      },
      {
        position: 8,
        title: "Ensayos (seleccion)",
        author: "Montaigne",
        start_date: "2026-09-01",
        end_date: "2026-10-02",
        style: "reflexiva_lenta",
        intensity: null,
        difficulty: null,
      },
      {
        position: 9,
        title: "El hombre en busca de sentido",
        author: "Frankl",
        start_date: "2026-10-03",
        end_date: "2026-10-24",
        style: null,
        intensity: null,
        difficulty: null,
      },
    ],
  },
  {
    position: 4,
    name: "Fase 4 - Integracion",
    objective: "Integrar pensamiento y vida",
    start_date: "2026-10-25",
    end_date: "2027-02-02",
    books: [
      {
        position: 10,
        title: "Thinking, Fast and Slow",
        author: "Kahneman",
        start_date: "2026-10-25",
        end_date: "2026-12-18",
        style: null,
        intensity: null,
        difficulty: null,
      },
      {
        position: 11,
        title: "La conquista de la felicidad",
        author: "Russell",
        start_date: "2026-12-19",
        end_date: "2027-01-10",
        style: null,
        intensity: null,
        difficulty: null,
      },
      {
        position: 12,
        title: "El hombre mediocre",
        author: "Ingenieros",
        start_date: "2027-01-11",
        end_date: "2027-02-02",
        style: null,
        intensity: null,
        difficulty: null,
      },
    ],
  },
  {
    position: 5,
    name: "Fase final - Buffer y cierre",
    objective: "Absorber desvios, relecturas y evaluaciones finales",
    start_date: "2026-12-19",
    end_date: "2026-12-31",
    books: [],
  },
];
