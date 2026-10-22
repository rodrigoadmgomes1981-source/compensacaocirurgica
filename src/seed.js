// Quadro atual de cirurgias, metas, valores unitários e regras de compensação
// (documento de Compensação Cirúrgica – Setembro/2026).
// Todo mês novo começa com este quadro e com o realizado em branco.
// valor: null = valor unitário ainda não informado.
export const QUADRO_PADRAO = [
  {
    "id": "uro",
    "nome": "Urologia",
    "repasseFixo": 40000,
    "procedimentos": [
      {
        "id": "uretero",
        "nome": "Ureterolitotomia",
        "meta": 16,
        "valor": 1318.32
      },
      {
        "id": "rtu",
        "nome": "RTU de próstata",
        "meta": 8,
        "valor": 1023.32
      },
      {
        "id": "vasect",
        "nome": "Vasectomia",
        "meta": 8,
        "valor": null
      },
      {
        "id": "postect",
        "nome": "Postectomia",
        "meta": 20,
        "valor": 300
      },
      {
        "id": "hidro",
        "nome": "Hidrocele",
        "meta": 4,
        "valor": 300
      },
      {
        "id": "prost",
        "nome": "Prostatectomia suprapúbica",
        "meta": 0,
        "valor": null
      }
    ],
    "regras": [
      {
        "id": "u1",
        "origem": [
          "prost"
        ],
        "qtdOrigem": 1,
        "destino": [
          "rtu"
        ],
        "qtdDestino": 1,
        "obs": "Mesmo peso"
      },
      {
        "id": "u2",
        "origem": [
          "postect",
          "hidro"
        ],
        "qtdOrigem": 5,
        "destino": [
          "uretero"
        ],
        "qtdDestino": 1,
        "obs": "Menores compensam maior"
      },
      {
        "id": "u3",
        "origem": [
          "vasect"
        ],
        "qtdOrigem": 3,
        "destino": [
          "uretero"
        ],
        "qtdDestino": 1,
        "obs": ""
      }
    ]
  },
  {
    "id": "cg",
    "nome": "Cirurgia geral",
    "repasseFixo": 54000,
    "procedimentos": [
      {
        "id": "colec",
        "nome": "Colecistectomia",
        "meta": 28,
        "valor": 1248.18
      },
      {
        "id": "hemorr",
        "nome": "Hemorroidectomia",
        "meta": 8,
        "valor": null
      },
      {
        "id": "ing",
        "nome": "Hérnia inguinal",
        "meta": 8,
        "valor": 610
      },
      {
        "id": "incis",
        "nome": "Hérnia incisional",
        "meta": 8,
        "valor": null
      },
      {
        "id": "umb",
        "nome": "Hérnia umbilical",
        "meta": 8,
        "valor": null
      }
    ],
    "regras": [
      {
        "id": "c1",
        "origem": [
          "umb"
        ],
        "qtdOrigem": 1,
        "destino": [
          "hemorr"
        ],
        "qtdDestino": 1,
        "obs": "Mesmo peso"
      },
      {
        "id": "c2",
        "origem": [
          "ing"
        ],
        "qtdOrigem": 1,
        "destino": [
          "incis"
        ],
        "qtdDestino": 1,
        "obs": "Mesmo peso"
      },
      {
        "id": "c3",
        "origem": [
          "ing"
        ],
        "qtdOrigem": 1,
        "destino": [
          "hemorr"
        ],
        "qtdDestino": 2,
        "obs": ""
      },
      {
        "id": "c4",
        "origem": [
          "ing"
        ],
        "qtdOrigem": 2,
        "destino": [
          "colec"
        ],
        "qtdDestino": 1,
        "obs": ""
      }
    ]
  },
  {
    "id": "gin",
    "nome": "Ginecologia",
    "repasseFixo": 40000,
    "procedimentos": [
      {
        "id": "histt",
        "nome": "Histerectomia total",
        "meta": 20,
        "valor": 905
      },
      {
        "id": "laq",
        "nome": "Laqueadura",
        "meta": 8,
        "valor": null
      },
      {
        "id": "colpo",
        "nome": "Colpoperineoplastia",
        "meta": 12,
        "valor": null
      },
      {
        "id": "hists",
        "nome": "Histerectomia subtotal",
        "meta": 0,
        "valor": 905
      }
    ],
    "regras": [
      {
        "id": "g1",
        "origem": [
          "histt"
        ],
        "qtdOrigem": 1,
        "destino": [
          "laq",
          "colpo"
        ],
        "qtdDestino": 2,
        "obs": "1 histerectomia = 2 procedimentos menores"
      }
    ]
  },
  {
    "id": "orto",
    "nome": "Ortopedia",
    "repasseFixo": 45000,
    "procedimentos": [
      {
        "id": "lca",
        "nome": "Reconstrução LCA",
        "meta": 12,
        "valor": 1750
      },
      {
        "id": "menisco",
        "nome": "Menisco",
        "meta": 20,
        "valor": 730
      },
      {
        "id": "cisto",
        "nome": "Cisto sinovial",
        "meta": 8,
        "valor": null
      },
      {
        "id": "dedo",
        "nome": "Dedo em gatilho",
        "meta": 4,
        "valor": null
      },
      {
        "id": "tunel",
        "nome": "Túnel do carpo",
        "meta": 12,
        "valor": 380
      }
    ],
    "regras": [
      {
        "id": "o1",
        "origem": [
          "tunel"
        ],
        "qtdOrigem": 1,
        "destino": [
          "cisto"
        ],
        "qtdDestino": 4,
        "obs": ""
      },
      {
        "id": "o2",
        "origem": [
          "menisco"
        ],
        "qtdOrigem": 1,
        "destino": [
          "dedo"
        ],
        "qtdDestino": 2,
        "obs": ""
      }
    ]
  },
  {
    "id": "orl",
    "nome": "Otorrinolaringologia",
    "repasseFixo": 30000,
    "procedimentos": [
      {
        "id": "adeno",
        "nome": "Adenoidectomia",
        "meta": 30,
        "valor": null
      },
      {
        "id": "amig",
        "nome": "Amigdalectomia",
        "meta": 4,
        "valor": 625
      },
      {
        "id": "turb",
        "nome": "Turbinectomia",
        "meta": 8,
        "valor": null
      },
      {
        "id": "septo",
        "nome": "Septoplastia",
        "meta": 6,
        "valor": 625
      }
    ],
    "regras": [
      {
        "id": "r1",
        "origem": [
          "adeno",
          "amig",
          "turb",
          "septo"
        ],
        "qtdOrigem": 1,
        "destino": [
          "adeno",
          "amig",
          "turb",
          "septo"
        ],
        "qtdDestino": 1,
        "obs": "Todos os procedimentos têm o mesmo peso"
      }
    ]
  },
  {
    "id": "vasc",
    "nome": "Cirurgia vascular",
    "repasseFixo": 46700,
    "procedimentos": [
      {
        "id": "varizes",
        "nome": "Tratamento cirúrgico de varizes",
        "meta": 40,
        "valor": null
      }
    ],
    "regras": []
  }
]
