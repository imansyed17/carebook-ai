import { Link } from 'react-router-dom'

export default function ProviderCard({ provider }) {
    return (
        <div className="bg-white rounded-2xl shadow-card card-hover p-6 border border-surface-100 animate-fade-in" id={`provider-card-${provider.id}`}>
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center shadow-sm">
                        {provider.avatar_url ? (
                            <img
                                src={provider.avatar_url}
                                alt={`Dr. ${provider.first_name} ${provider.last_name}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-display font-bold text-primary-700">
                                {provider.first_name[0]}{provider.last_name[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-display font-bold text-surface-900">
                                Dr. {provider.first_name} {provider.last_name}
                                <span className="text-surface-400 font-normal text-sm ml-1">, {provider.title}</span>
                            </h3>
                            <p className="text-primary-600 font-medium text-sm">{provider.specialty}</p>
                        </div>
                        {provider.accepting_new_patients ? (
                            <span className="badge-success flex-shrink-0">Accepting Patients</span>
                        ) : (
                            <span className="badge-warning flex-shrink-0">Not Accepting</span>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mt-2 text-surface-500 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="truncate">{provider.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(provider.rating) ? 'text-amber-400' : 'text-surface-200'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-surface-700">{provider.rating}</span>
                        <span className="text-xs text-surface-400">({provider.review_count} reviews)</span>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-surface-500 text-sm mt-3 line-clamp-2 leading-relaxed">{provider.bio}</p>

                    {/* Action */}
                    <div className="mt-4 flex items-center gap-3">
                        <Link
                            to={`/book/${provider.id}`}
                            className="btn-primary text-sm !px-5 !py-2.5"
                            id={`book-btn-${provider.id}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                Book Appointment
                            </span>
                        </Link>
                        <Link
                            to={`/book/${provider.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            View Profile →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
