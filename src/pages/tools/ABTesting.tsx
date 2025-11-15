import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface Variant {
  id: string
  name: string
  description: string
  traffic_allocation: number
  impressions: number
  conversions: number
  revenue: number
  conversion_rate: number
  revenue_per_visitor: number
}

interface Experiment {
  id: string
  name: string
  description: string
  type: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'
  variants: Variant[]
  start_date?: string
  end_date?: string
  created_at: string
  primary_metric: string
  minimum_sample_size: number
  confidence_level: number
  winner?: string
  statistical_significance?: number
}

interface ExperimentResults {
  experiment: Experiment
  variants: Variant[]
  winner?: string
  statistical_significance?: number
  is_significant: boolean
  sample_size_met: boolean
  recommendations: string[]
}

const EXPERIMENT_TYPES = [
  { value: 'email_subject', label: 'Email Subject Line' },
  { value: 'email_content', label: 'Email Content' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'cta_button', label: 'CTA Button' },
  { value: 'pricing_page', label: 'Pricing Page' },
  { value: 'ad_creative', label: 'Ad Creative' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'custom', label: 'Custom' }
]

export default function ABTesting() {
  const [activeTab, setActiveTab] = useState<'experiments' | 'create' | 'results'>('experiments')
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [, setSelectedExperiment] = useState<string | null>(null)
  const [experimentResults, setExperimentResults] = useState<ExperimentResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for creating experiments
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom',
    variant_names: ['Control', 'Variant A'],
    variant_descriptions: ['', ''],
    minimum_sample_size: 100,
    confidence_level: 0.95
  })

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    try {
      const response = await fetch('/api/experiments')
      const data = await response.json()
      if (data.ok) {
        setExperiments(data.experiments)
      }
    } catch (err) {
      console.error('Failed to load experiments:', err)
    }
  }

  const createExperiment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.ok) {
        await loadExperiments()
        setActiveTab('experiments')
        // Reset form
        setFormData({
          name: '',
          description: '',
          type: 'custom',
          variant_names: ['Control', 'Variant A'],
          variant_descriptions: ['', ''],
          minimum_sample_size: 100,
          confidence_level: 0.95
        })
      } else {
        setError(data.error || 'Failed to create experiment')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startExperiment = async (experimentId: string) => {
    try {
      const response = await fetch(`/api/experiments/${experimentId}/start`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.ok) {
        await loadExperiments()
      }
    } catch (err) {
      console.error('Failed to start experiment:', err)
    }
  }

  const pauseExperiment = async (experimentId: string) => {
    try {
      const response = await fetch(`/api/experiments/${experimentId}/pause`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.ok) {
        await loadExperiments()
      }
    } catch (err) {
      console.error('Failed to pause experiment:', err)
    }
  }

  const completeExperiment = async (experimentId: string) => {
    try {
      const response = await fetch(`/api/experiments/${experimentId}/complete`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.ok) {
        await loadExperiments()
      }
    } catch (err) {
      console.error('Failed to complete experiment:', err)
    }
  }

  const viewResults = async (experimentId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/experiments/${experimentId}/results`)
      const data = await response.json()
      if (data.ok) {
        setExperimentResults(data as ExperimentResults)
        setSelectedExperiment(experimentId)
        setActiveTab('results')
      }
    } catch (err) {
      console.error('Failed to load results:', err)
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variant_names: [...formData.variant_names, `Variant ${String.fromCharCode(65 + formData.variant_names.length - 1)}`],
      variant_descriptions: [...formData.variant_descriptions, '']
    })
  }

  const removeVariant = (index: number) => {
    if (formData.variant_names.length <= 2) return // Need at least 2 variants

    setFormData({
      ...formData,
      variant_names: formData.variant_names.filter((_, i) => i !== index),
      variant_descriptions: formData.variant_descriptions.filter((_, i) => i !== index)
    })
  }

  const updateVariantName = (index: number, value: string) => {
    const newNames = [...formData.variant_names]
    newNames[index] = value
    setFormData({ ...formData, variant_names: newNames })
  }

  const updateVariantDescription = (index: number, value: string) => {
    const newDescriptions = [...formData.variant_descriptions]
    newDescriptions[index] = value
    setFormData({ ...formData, variant_descriptions: newDescriptions })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      running: 'bg-green-500/20 text-green-300 border-green-500/30',
      paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    return EXPERIMENT_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <BeakerIcon className="h-8 w-8 text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            A/B Testing Lab
          </h1>
        </motion.div>
        <p className="text-gray-400">
          Create experiments, test variations, and optimize your marketing with data-driven insights.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'experiments'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            <span>Experiments</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'create'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            <span>Create New</span>
          </div>
        </button>
        {experimentResults && (
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'results'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5" />
              <span>Results</span>
            </div>
          </button>
        )}
      </div>

      {/* Experiments List Tab */}
      {activeTab === 'experiments' && (
        <div className="space-y-4">
          {experiments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <BeakerIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No experiments yet</h3>
              <p className="text-gray-400 mb-6">Create your first A/B test to get started</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
              >
                Create Experiment
              </button>
            </motion.div>
          ) : (
            experiments.map((experiment, index) => (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{experiment.name}</h3>
                      {getStatusBadge(experiment.status)}
                    </div>
                    <p className="text-gray-400 mb-2">{experiment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {getTypeLabel(experiment.type)}
                      </span>
                      <span>{experiment.variants.length} variants</span>
                      {experiment.start_date && (
                        <span>Started {new Date(experiment.start_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {experiment.status === 'draft' && (
                      <button
                        onClick={() => startExperiment(experiment.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Start
                      </button>
                    )}
                    {experiment.status === 'running' && (
                      <>
                        <button
                          onClick={() => pauseExperiment(experiment.id)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <PauseIcon className="h-4 w-4" />
                          Pause
                        </button>
                        <button
                          onClick={() => completeExperiment(experiment.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Complete
                        </button>
                      </>
                    )}
                    {experiment.status === 'paused' && (
                      <button
                        onClick={() => startExperiment(experiment.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => viewResults(experiment.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      Results
                    </button>
                  </div>
                </div>

                {/* Variant Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
                  {experiment.variants.map((variant) => (
                    <div key={variant.id} className="text-center">
                      <div className="text-sm font-medium text-gray-400 mb-1">{variant.name}</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {variant.conversion_rate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {variant.conversions} / {variant.impressions} conv.
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create Experiment Tab */}
      {activeTab === 'create' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={createExperiment}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Create New Experiment</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experiment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g., Homepage CTA Button Test"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="What are you testing and why?"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experiment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {EXPERIMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Variants ({formData.variant_names.length})
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {formData.variant_names.map((name, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => updateVariantName(index, e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-2"
                          placeholder={`Variant ${index} name`}
                          required
                        />
                        <input
                          type="text"
                          value={formData.variant_descriptions[index]}
                          onChange={(e) => updateVariantDescription(index, e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          placeholder="Description of this variant"
                          required
                        />
                      </div>
                      {formData.variant_names.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Sample Size (per variant)
                </label>
                <input
                  type="number"
                  value={formData.minimum_sample_size}
                  onChange={(e) => setFormData({ ...formData, minimum_sample_size: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  min="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confidence Level
                </label>
                <select
                  value={formData.confidence_level}
                  onChange={(e) => setFormData({ ...formData, confidence_level: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="0.90" className="bg-gray-900">90% (0.90)</option>
                  <option value="0.95" className="bg-gray-900">95% (0.95)</option>
                  <option value="0.99" className="bg-gray-900">99% (0.99)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Experiment'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('experiments')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && experimentResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{experimentResults.experiment.name}</h2>
            <p className="text-gray-400 mb-4">{experimentResults.experiment.description}</p>
            <div className="flex items-center gap-4">
              {getStatusBadge(experimentResults.experiment.status)}
              {experimentResults.is_significant && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  Statistically Significant
                </span>
              )}
              {!experimentResults.sample_size_met && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
                  Need More Data
                </span>
              )}
            </div>
          </div>

          {/* Variants Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experimentResults.variants.map((variant, index) => {
              const isWinner = variant.id === experimentResults.winner
              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 ${
                    isWinner ? 'border-green-500 ring-2 ring-green-500/20' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{variant.name}</h3>
                    {isWinner && (
                      <TrophyIcon className="h-6 w-6 text-green-400" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Conversion Rate</span>
                        {index > 0 && (
                          <span className={`text-xs flex items-center gap-1 ${
                            variant.conversion_rate > experimentResults.variants[0].conversion_rate
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {variant.conversion_rate > experimentResults.variants[0].conversion_rate ? (
                              <ArrowTrendingUpIcon className="h-3 w-3" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-3 w-3" />
                            )}
                            {Math.abs(variant.conversion_rate - experimentResults.variants[0].conversion_rate).toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {variant.conversion_rate.toFixed(2)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>Impressions</span>
                        </div>
                        <div className="text-white font-semibold">{variant.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Conversions</span>
                        </div>
                        <div className="text-white font-semibold">{variant.conversions.toLocaleString()}</div>
                      </div>
                    </div>

                    {variant.revenue > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1 text-sm">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>Revenue per Visitor</span>
                        </div>
                        <div className="text-white font-semibold">
                          ${variant.revenue_per_visitor.toFixed(2)}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <div className="text-xs text-gray-500">Traffic Allocation</div>
                      <div className="text-sm text-white font-medium">
                        {(variant.traffic_allocation * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Recommendations */}
          {experimentResults.recommendations.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                {experimentResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistical Info */}
          {experimentResults.statistical_significance !== null && experimentResults.statistical_significance !== undefined && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistical Analysis</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Confidence Level</div>
                  <div className="text-2xl font-bold text-white">
                    {(experimentResults.statistical_significance * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Required Confidence</div>
                  <div className="text-2xl font-bold text-white">
                    {(experimentResults.experiment.confidence_level * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
