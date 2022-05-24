export type WithoutGeoMat<T> = Omit<T, 'geometry' | 'material'>;
