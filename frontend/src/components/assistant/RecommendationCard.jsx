import { useAssistant } from '../../context/AssistantContext'
import { formatDate, formatTime } from '../../services/assistantService'

export default function RecommendationCard({ recommendations }) {
    const { selectRecommendation } = useAssistant()

    if (!recommendations || recommendations.length === 0) return null

    return (
        <div className="space-y-3">
            {recommendations.map((rec, index) => {
                const { provider, nextAvailableDate, nextAvailableTime, totalSlots, reasons } = rec
                return (
                    <div
                        key={provider.id}
                        className="bg-white rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all overflow-hidden"
                    >
                        {/* Rank badge */}
                        {index === 0 && (
                            <div className="bg-gradient-to-r from-primary-600 to-teal-500 px-3 py-1">
                                <p className="text-xs font-semibold text-white flex items-center gap-1">
                                    ⭐ Top Recommendation
                                </p>
                            </div>
                        )}

                        <div className="p-3.5">
                            {/* Provider info */}
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="text-sm font-bold text-surface-800">
                                        Dr. {provider.first_name} {provider.last_name}
                                    </h4>
                                    <p className="text-xs text-surface-500">{provider.specialty}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <span className="text-xs">⭐</span>
                                    <span className="text-xs font-semibold text-amber-700">{provider.rating}</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                {provider.location}
                            </div>

                            {/* Next available */}
                            <div className="flex items-center gap-1.5 text-xs text-primary-700 font-medium mb-3 bg-primary-50 rounded-lg px-2.5 py-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Next: {formatDate(nextAvailableDate)} at {formatTime(nextAvailableTime)} · {totalSlots} slot{totalSlots !== 1 ? 's' : ''} available
                            </div>

                            {/* Reasons */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {reasons.slice(0, 3).map((reason, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-100 text-surface-600">
                                        ✓ {reason}
                                    </span>
                                ))}
                            </div>

                            {/* Select button */}
                            <button
                                onClick={() => selectRecommendation(rec)}
                                className="w-full py-2 rounded-lg text-xs font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                            >
                                View Available Slots →
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
