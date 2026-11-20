/**
 * Public service entry point.
 *
 * With Supabase credentials present the browser client uses the Supabase
 * backend; without them (and in the Node rule tests) it falls back to the
 * original deterministic local prototype. Every caller imports from here, so
 * the UI never needs to know which backend is active.
 */
import * as local from './localApi.js';
import * as remote from './supabaseApi.js';
import { ApiError } from './errors.js';

const env = import.meta.env || globalThis.__RS_ENV__ || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const requested = env.VITE_DATA_SOURCE || (url && key ? 'supabase' : 'local');

export const DATA_SOURCE = requested === 'supabase' && url && key ? 'supabase' : 'local';
const backend = DATA_SOURCE === 'supabase' ? remote : local;

export { ApiError };
export const subscribe = backend.subscribe;
export const getPublicStats = backend.getPublicStats;
export const getSiteContent = backend.getSiteContent;
export const getProgrammes = backend.getProgrammes;
export const getCatalogue = backend.getCatalogue;
export const identify = backend.identify;
export const getTitleById = backend.getTitleById;
export const getSelectionForStudent = backend.getSelectionForStudent;
export const reserve = backend.reserve;
export const getSelectionByRef = backend.getSelectionByRef;
export const updateSelectionDetails = backend.updateSelectionDetails;
export const changeSelectionTitle = backend.changeSelectionTitle;
export const createOrder = backend.createOrder;
export const adminLogin = backend.adminLogin;
export const listProgrammesAdmin = backend.listProgrammesAdmin;
export const getAdminStats = backend.getAdminStats;
export const createProgramme = backend.createProgramme;
export const updateProgramme = backend.updateProgramme;
export const addTitle = backend.addTitle;
export const updateTitle = backend.updateTitle;
export const setTitleStatus = backend.setTitleStatus;
export const validateImport = backend.validateImport;
export const commitImport = backend.commitImport;
export const listTitlesAdmin = backend.listTitlesAdmin;
export const listSelections = backend.listSelections;
export const releaseSelection = backend.releaseSelection;
export const listOrders = backend.listOrders;
export const updateOrder = backend.updateOrder;
export const listStudentsAdmin = backend.listStudentsAdmin;
export const updateStudentAdmin = backend.updateStudentAdmin;
export const updateSiteContent = backend.updateSiteContent;
export const listAudit = backend.listAudit;
