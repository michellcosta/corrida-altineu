
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** corrida-altineu
- **Date:** 2026-03-09
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Home loads and shows hero and countdown
- **Test Code:** [TC001_Home_loads_and_shows_hero_and_countdown.py](./TC001_Home_loads_and_shows_hero_and_countdown.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/d6e4ba1c-1b2e-4e41-9794-2f90f6a7b28f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Navigate from category card 'Geral 10K' to category page
- **Test Code:** [TC003_Navigate_from_category_card_Geral_10K_to_category_page.py](./TC003_Navigate_from_category_card_Geral_10K_to_category_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/52fb4dd3-c9e7-480b-af96-7d91d1320218
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 End-to-end CTA flow: Home -> Geral 10K -> Inscrever-se -> Registration wizard
- **Test Code:** [TC005_End_to_end_CTA_flow_Home___Geral_10K___Inscrever_se___Registration_wizard.py](./TC005_End_to_end_CTA_flow_Home___Geral_10K___Inscrever_se___Registration_wizard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/c6d41387-e693-49fd-9e11-b4c76bb6cd3f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 CTA from hero navigates to registration when registrations are open
- **Test Code:** [TC006_CTA_from_hero_navigates_to_registration_when_registrations_are_open.py](./TC006_CTA_from_hero_navigates_to_registration_when_registrations_are_open.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/7b1a67b7-6eb0-487c-8fe5-2f3713794c9a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Geral 10K: completar inscrição até visualizar QR Code do PIX
- **Test Code:** [TC009_Geral_10K_completar_inscrio_at_visualizar_QR_Code_do_PIX.py](./TC009_Geral_10K_completar_inscrio_at_visualizar_QR_Code_do_PIX.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/e6229676-1cf6-44b7-9daf-bf1b1618fa62
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Geral 10K: validação de campos obrigatórios ao tentar pagar vazio
- **Test Code:** [TC010_Geral_10K_validao_de_campos_obrigatrios_ao_tentar_pagar_vazio.py](./TC010_Geral_10K_validao_de_campos_obrigatrios_ao_tentar_pagar_vazio.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/a2a594a1-dc2f-43de-bd5c-2b7b8f3126a2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Search registration by valid confirmation code and view details
- **Test Code:** [TC011_Search_registration_by_valid_confirmation_code_and_view_details.py](./TC011_Search_registration_by_valid_confirmation_code_and_view_details.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No registration details displayed after searching with confirmation code; page shows message 'Nenhuma inscrição encontrada.'
- Heading 'Detalhes da inscrição' not found on the results page after submitting the confirmation code
- Registration details section element is not present or visible after the search
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/9f6c95ee-6bfc-4b62-9561-f6a2103eeb53
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Search registration by valid CPF and view details
- **Test Code:** [TC012_Search_registration_by_valid_CPF_and_view_details.py](./TC012_Search_registration_by_valid_CPF_and_view_details.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Search returned the message 'Nenhuma inscrição encontrada.' instead of displaying 'Detalhes da inscrição'.
- No registration details were displayed after submitting CPF '123.456.789-09'.
- Element 'Detalhes da inscrição' was not found on the results page.
- The registration status element was not visible after the search.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/0f5ba267-2305-4176-9578-de1ce94fd613
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Invalid confirmation code shows Registration not found message
- **Test Code:** [TC013_Invalid_confirmation_code_shows_Registration_not_found_message.py](./TC013_Invalid_confirmation_code_shows_Registration_not_found_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/93920d8a-e99e-4254-b77c-9eb3d234951f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Generate PIX option is available for pending payment registration
- **Test Code:** [TC015_Generate_PIX_option_is_available_for_pending_payment_registration.py](./TC015_Generate_PIX_option_is_available_for_pending_payment_registration.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- "Nenhuma inscrição encontrada" message displayed after searching for confirmation code 'PENDING_PAYMENT_CODE'.
- Expected text 'Pagamento pendente' is not present on the page after performing the search.
- 'Gerar PIX' action could not be initiated because no pending registration was returned.
- Test data for a pending registration appears to be missing or the lookup feature did not return expected results.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/3822e719-83d2-4dda-94c0-2ef4813684d5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Pay with PIX displays QR code for payment
- **Test Code:** [TC016_Pay_with_PIX_displays_QR_code_for_payment.py](./TC016_Pay_with_PIX_displays_QR_code_for_payment.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No registration found for confirmation code 'PENDING_PAYMENT_CODE' (page displays 'Nenhuma inscrição encontrada.').
- Payment actions 'Gerar PIX' and 'Pagar com PIX' are not present because the search returned no results.
- Unable to verify PIX QR code or the text 'QR Code' because the payment UI did not appear.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/4c58ec02-24b9-4acb-a649-42eed4e3f80e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Edit athlete data and save updates successfully
- **Test Code:** [TC017_Edit_athlete_data_and_save_updates_successfully.py](./TC017_Edit_athlete_data_and_save_updates_successfully.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No registration details were displayed after consulting the confirmation code; the page shows 'Nenhuma inscrição encontrada.'
- Edit controls (for example an 'Editar' button or 'Edit athlete data' form) are not present on the registration results page
- Editing cannot be performed because the registration lookup returned no results
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/ce1a1014-a39a-4d75-8f79-f70c43b1bf6b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Filter results by category and year and view list updates
- **Test Code:** [TC020_Filter_results_by_category_and_year_and_view_list_updates.py](./TC020_Filter_results_by_category_and_year_and_view_list_updates.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Resultados page did not remain loaded: navigation repeatedly returned to /programacao, preventing stable interaction with Resultados UI.
- Results-specific controls (category select, edition buttons, results list) were not persistently available after attempts to apply filters.
- Selection of 'Geral 10K' and '2026' could not be validated because the results area was either not visible or showed 'Nenhum resultado encontrado' after interactions.
- Required interactive element indexes became stale or unavailable due to navigation flaps, blocking automation from applying and verifying filters.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/607de9d4-c64f-4051-af47-dff186ea9ae0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Search results by athlete name after applying filters
- **Test Code:** [TC021_Search_results_by_athlete_name_after_applying_filters.py](./TC021_Search_results_by_athlete_name_after_applying_filters.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/510fe9c6-aee6-4e43-8575-5cbc6ade9d8f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 No-match search shows a clear empty state message
- **Test Code:** [TC023_No_match_search_shows_a_clear_empty_state_message.py](./TC023_No_match_search_shows_a_clear_empty_state_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/98d1bfa4-8490-420e-94ef-ba9d2e5bab13/bfca0d64-c6a1-454c-a0c8-b9db19abd731
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **60.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---