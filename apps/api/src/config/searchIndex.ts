export const definition = {
  analyzer: 'lucene.standard',
  mappings: {
    dynamic: false,
    fields: {
      _id: {
        type: 'objectId',
      }, // for sorting
      name: {
        type: 'string',
        analyzer: 'lucene.english',
        multi: {
          arabicAnalyzer: {
            type: 'string',
            analyzer: 'lucene.arabic',
          },
        },
      },
      profile: {
        fields: {
          bio: {
            type: 'string',
            analyzer: 'lucene.english',
            multi: {
              arabicAnalyzer: {
                type: 'string',
                analyzer: 'lucene.arabic',
              },
            },
          },
          headline: {
            type: 'string',
            analyzer: 'lucene.english',
            multi: {
              arabicAnalyzer: {
                type: 'string',
                analyzer: 'lucene.arabic',
              },
            },
          },
          hourlyRate: {
            type: 'number',
          },
          isAvailable: {
            type: 'boolean',
          },
          languages: {
            type: 'token',
          },
          rating: {
            type: 'number',
          },
          status: {
            type: 'token',
          },
        },
        type: 'document',
      },
      subjects: {
        fields: {
          category: {
            type: 'token',
          },
          curriculum: {
            type: 'token',
          },
          educationLevel: {
            type: 'token',
          },
          title: {
            type: 'string',
            analyzer: 'lucene.english',
            multi: {
              arabicAnalyzer: {
                type: 'string',
                analyzer: 'lucene.arabic',
              },
            },
          },
          description: {
            type: 'string',
            analyzer: 'lucene.english',
            multi: {
              arabicAnalyzer: {
                type: 'string',
                analyzer: 'lucene.arabic',
              },
            },
          },
          gradeNote: {
            type: 'string',
            analyzer: 'lucene.english',
            multi: {
              arabicAnalyzer: {
                type: 'string',
                analyzer: 'lucene.arabic',
              },
            },
          },
        },
        type: 'document',
      },
    },
  },
};
