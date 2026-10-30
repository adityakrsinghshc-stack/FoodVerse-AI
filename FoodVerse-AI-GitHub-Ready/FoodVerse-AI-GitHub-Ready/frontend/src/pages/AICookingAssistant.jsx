import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeech } from '../hooks/useSpeech';
import { foodApi } from '../services/api';
import {
  ChefHat,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  Users,
  AlertTriangle,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Bot,
  User,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function AICookingAssistant() {
  const { addToast, userProfile } = useApp();
  const { isListening, transcript, startListening, stopListening, speak, stopSpeaking, isSpeaking, isSpeechSupported } = useSpeech();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am your Food Verse AI Cooking Assistant. Ask me what to cook with ingredients in your kitchen, request healthy recipe suggestions, or ask for dietary substitutions and safe food storage advice.",
      recipes: [],
      mode: 'Predefined Culinary Intelligence Engine (Offline Fallback)',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState(['potatoes', 'tomatoes', 'onions']);
  const [newIngredient, setNewIngredient] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (transcript) {
      setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (msgToSend = inputMessage) => {
    const text = msgToSend.trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await foodApi.chatCooking({
        message: text,
        chat_history: historyPayload,
        dietary_preference: userProfile.dietary_preference || 'all',
        available_ingredients: availableIngredients,
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.response_text,
        recipes: res.recipes || [],
        mode: res.mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      addToast(err.message || 'Culinary assistant error.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error retrieving recipe guidance. Please check your connectivity and try again.',
          recipes: [],
          mode: 'System Notice',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;
    if (!availableIngredients.includes(newIngredient.trim().toLowerCase())) {
      setAvailableIngredients([...availableIngredients, newIngredient.trim().toLowerCase()]);
    }
    setNewIngredient('');
  };

  const removeIngredient = (ing) => {
    setAvailableIngredients(availableIngredients.filter((i) => i !== ing));
  };

  const readRecipeAloud = (recipe) => {
    const text = `Recipe for ${recipe.title}. Serves ${recipe.servings}. Prep time ${recipe.prep_time_min} minutes. Cook time ${recipe.cook_time_min} minutes. Instructions: ${recipe.instructions.join('. ')}`;
    speak(text);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <ChefHat className="w-3.5 h-3.5" />
          <span>Conversational Culinary Nutritionist</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Cooking Assistant
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Ask questions naturally with text or voice. Generate ingredient-matched recipes with exact measurements, substitutions, allergy warnings, and food safety advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ingredients & Suggestions Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card title="Available Pantry Ingredients" icon={Layers}>
            <div className="space-y-3 text-xs">
              <form onSubmit={handleAddIngredient} className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add item (e.g. garlic, paneer)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 transition-colors"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-forest-50 text-forest-900 border border-forest-200 font-medium"
                  >
                    <span>{ing}</span>
                    <button
                      onClick={() => removeIngredient(ing)}
                      className="text-forest-400 hover:text-rose-600 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <button
                onClick={() =>
                  handleSendMessage(
                    `What can I cook with ${availableIngredients.join(', ')}?`
                  )
                }
                disabled={availableIngredients.length === 0 || loading}
                className="w-full py-2.5 px-3 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Recipes With My Ingredients</span>
              </button>
            </div>
          </Card>

          {/* Quick Prompts */}
          <Card title="Quick Inquiries" icon={Sparkles}>
            <div className="space-y-2 text-xs">
              {[
                'What can I cook with potatoes, tomatoes, and onions?',
                'Suggest a healthy vegetarian dinner recipe',
                'How can I replace heavy cream in a soup?',
                'What is the safe cooking temperature for chicken?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-lime-500 hover:bg-slate-50 text-slate-700 transition-colors leading-relaxed text-[11px]"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Conversation Column */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex space-x-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-forest-800 text-white'
                      : 'bg-lime-100 text-forest-900 border border-lime-300'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-3 max-w-xl">
                  {/* Text bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-forest-900 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.mode && msg.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Mode: {msg.mode}</span>
                      </div>
                    )}
                  </div>

                  {/* Structured Recipe Cards inside chat */}
                  {msg.recipes && msg.recipes.length > 0 && (
                    <div className="space-y-4 pt-1">
                      {msg.recipes.map((recipe, rIdx) => (
                        <div
                          key={rIdx}
                          className="bg-cream-50/80 rounded-2xl border border-cream-200 p-5 space-y-4 shadow-sm"
                        >
                          {/* Recipe Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {recipe.dietary_tags.map((t) => (
                                  <Badge key={t} variant="forest" size="sm">
                                    {t}
                                  </Badge>
                                ))}
                                <Badge variant="lime" size="sm">
                                  {recipe.difficulty}
                                </Badge>
                              </div>
                              <h4 className="font-bold text-slate-900 text-base">
                                {recipe.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {recipe.description}
                              </p>
                            </div>

                            {/* TTS button */}
                            <button
                              onClick={() =>
                                isSpeaking ? stopSpeaking() : readRecipeAloud(recipe)
                              }
                              className={`p-2 rounded-xl transition-colors shadow-sm shrink-0 ${
                                isSpeaking
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white hover:bg-forest-100 text-forest-800 border border-slate-200'
                              }`}
                              title={isSpeaking ? 'Stop Audio' : 'Listen Step-by-Step (TTS)'}
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 px-3 rounded-xl bg-white border border-cream-200">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Prep / Cook</span>
                              <span className="font-bold text-slate-800">
                                {recipe.prep_time_min}m / {recipe.cook_time_min}m
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Servings</span>
                              <span className="font-bold text-slate-800">{recipe.servings} people</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Calories</span>
                              <span className="font-bold text-forest-700">
                                {recipe.calories_per_serving} kcal/serv
                              </span>
                            </div>
                          </div>

                          {/* Ingredients List */}
                          <div className="space-y-1.5 text-xs">
                            <span className="font-bold text-slate-800 block">Ingredients:</span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                              {recipe.ingredients.map((ing, iIdx) => (
                                <li key={iIdx} className="flex items-center space-x-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0" />
                                  <span>{ing}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Step-by-Step Instructions */}
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-slate-800 block">Step-by-Step Preparation:</span>
                            <ol className="space-y-2 pl-4 list-decimal text-[11px] text-slate-700 leading-relaxed">
                              {recipe.instructions.map((step, sIdx) => (
                                <li key={sIdx} className="pl-1">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Substitutions & Allergens */}
                          <div className="space-y-2 pt-2 border-t border-cream-200 text-xs">
                            {recipe.substitutions && recipe.substitutions.length > 0 && (
                              <div className="text-[11px] text-slate-600">
                                <span className="font-semibold text-slate-800">Substitutions: </span>
                                {recipe.substitutions.join(' ')}
                              </div>
                            )}

                            {recipe.allergen_notes && recipe.allergen_notes.length > 0 && (
                              <div className="text-[11px] text-amber-800 flex items-center space-x-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{recipe.allergen_notes.join(' ')}</span>
                              </div>
                            )}

                            {recipe.storage_and_handling && (
                              <div className="text-[11px] text-forest-800 bg-forest-50 p-2.5 rounded-xl border border-forest-100 flex items-start space-x-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                                <span>{recipe.storage_and_handling}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex space-x-3">
                <div className="w-9 h-9 rounded-xl bg-lime-100 text-forest-900 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-forest-600 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-forest-600 animate-pulse delay-150" />
                  <span className="ml-1">Curating culinary instructions...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center space-x-2">
              {/* Mic STT Button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak into Microphone'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask recipe, substitutions, or cooking steps..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="px-5 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
