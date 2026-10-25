package com.leadora.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.CampaignExpense;
import com.leadora.backend.model.Conversion;
import com.leadora.backend.model.Lead;
import com.leadora.backend.model.LeadSource;
import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.CampaignExpenseRepository;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.LeadSourceRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class ReportService {

    private final CampaignRepository campaignRepository;
    private final LeadRepository leadRepository;
    private final ConversionRepository conversionRepository;
    private final CampaignExpenseRepository expenseRepository;
    private final LeadSourceRepository sourceRepository;
    private final UserRepository userRepository;

    public ReportService(CampaignRepository campaignRepository,
                         LeadRepository leadRepository,
                         ConversionRepository conversionRepository,
                         CampaignExpenseRepository expenseRepository,
                         LeadSourceRepository sourceRepository,
                         UserRepository userRepository) {
        this.campaignRepository = campaignRepository;
        this.leadRepository = leadRepository;
        this.conversionRepository = conversionRepository;
        this.expenseRepository = expenseRepository;
        this.sourceRepository = sourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReportData(String reportType) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> headers = new ArrayList<>();

        switch (reportType.toLowerCase()) {
            case "campaign-performance": {
                headers = List.of("Campaign ID", "Campaign Name", "Type", "Status", "Budget", "Spent", "Impressions", "Clicks", "CTR (%)", "Leads");
                List<Campaign> campaigns = campaignRepository.findAll();
                for (Campaign c : campaigns) {
                    BigDecimal spent = expenseRepository.sumExpensesByCampaignId(c.getId());
                    long leads = leadRepository.findByCampaignId(c.getId()).size();
                    double ctr = (c.getImpressions() != null && c.getImpressions() > 0 && c.getClicks() != null)
                            ? Math.round(((double) c.getClicks() / c.getImpressions()) * 10000.0) / 100.0 : 0.0;
                    Map<String, Object> row = new HashMap<>();
                    row.put("Campaign ID", c.getId());
                    row.put("Campaign Name", c.getName());
                    row.put("Type", c.getType());
                    row.put("Status", c.getStatus());
                    row.put("Budget", c.getBudget());
                    row.put("Spent", spent);
                    row.put("Impressions", c.getImpressions());
                    row.put("Clicks", c.getClicks());
                    row.put("CTR (%)", ctr + "%");
                    row.put("Leads", leads);
                    rows.add(row);
                }
                break;
            }
            case "lead-generation": {
                headers = List.of("Lead ID", "Name", "Company", "Email", "Phone", "Status", "Source", "Campaign", "Score", "Qualification", "Date");
                List<Lead> leads = leadRepository.findAllOrderByCreatedAtDesc();
                for (Lead l : leads) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("Lead ID", l.getId());
                    row.put("Name", l.getName());
                    row.put("Company", l.getCompany());
                    row.put("Email", l.getEmail());
                    row.put("Phone", l.getPhone() != null ? l.getPhone() : "");
                    row.put("Status", l.getStatus());
                    row.put("Source", l.getSource() != null ? l.getSource().getName() : "Direct");
                    row.put("Campaign", l.getCampaign() != null ? l.getCampaign().getName() : "N/A");
                    row.put("Score", l.getLeadScore());
                    row.put("Qualification", l.getQualificationStatus());
                    row.put("Date", l.getCreatedAt() != null ? l.getCreatedAt().toString() : "");
                    rows.add(row);
                }
                break;
            }
            case "source-attribution": {
                headers = List.of("Source Channel", "Channel Type", "Status", "Total Leads", "Conversions", "Conversion Rate (%)");
                List<LeadSource> sources = sourceRepository.findAll();
                for (LeadSource s : sources) {
                    long totalLeads = leadRepository.countBySourceId(s.getId());
                    long convs = conversionRepository.findBySourceId(s.getId()).size();
                    double rate = (totalLeads > 0) ? Math.round(((double) convs / totalLeads) * 10000.0) / 100.0 : 0.0;
                    Map<String, Object> row = new HashMap<>();
                    row.put("Source Channel", s.getName());
                    row.put("Channel Type", s.getType());
                    row.put("Status", s.isActive() ? "Active" : "Inactive");
                    row.put("Total Leads", totalLeads);
                    row.put("Conversions", convs);
                    row.put("Conversion Rate (%)", rate + "%");
                    rows.add(row);
                }
                break;
            }
            case "conversion-analysis": {
                headers = List.of("Conversion ID", "Lead Name", "Company", "Deal Value", "Campaign", "Source", "Sales Rep", "Conversion Date");
                List<Conversion> convs = conversionRepository.findAll();
                for (Conversion c : convs) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("Conversion ID", c.getId());
                    row.put("Lead Name", c.getLead() != null ? c.getLead().getName() : "Unknown");
                    row.put("Company", c.getCustomerCompany());
                    row.put("Deal Value", c.getDealValue());
                    row.put("Campaign", c.getCampaign() != null ? c.getCampaign().getName() : "None");
                    row.put("Source", c.getSource() != null ? c.getSource().getName() : "Direct");
                    row.put("Sales Rep", c.getSalesUser() != null ? c.getSalesUser().getName() : "Unassigned");
                    row.put("Conversion Date", c.getConversionDate() != null ? c.getConversionDate().toString() : "");
                    rows.add(row);
                }
                break;
            }
            case "expenditure-budget": {
                headers = List.of("Expense ID", "Campaign Name", "Category", "Amount", "Expense Date", "Recorded By", "Description");
                List<CampaignExpense> expenses = expenseRepository.findAll();
                for (CampaignExpense e : expenses) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("Expense ID", e.getId());
                    row.put("Campaign Name", e.getCampaign() != null ? e.getCampaign().getName() : "N/A");
                    row.put("Category", e.getExpenseType());
                    row.put("Amount", e.getAmount());
                    row.put("Expense Date", e.getExpenseDate() != null ? e.getExpenseDate().toString() : "");
                    row.put("Recorded By", e.getCreatedBy() != null ? e.getCreatedBy().getName() : "System");
                    row.put("Description", e.getDescription() != null ? e.getDescription() : "");
                    rows.add(row);
                }
                break;
            }
            case "sales-performance": {
                headers = List.of("Representative", "Email", "Department", "Assigned Leads", "Converted", "Lost", "Total Deal Value");
                List<User> salesReps = userRepository.findByRole(Role.SALES_EXECUTIVE);
                for (User rep : salesReps) {
                    List<Lead> myLeads = leadRepository.findByAssignedUserId(rep.getId());
                    long converted = myLeads.stream().filter(l -> "Converted".equals(l.getStatus())).count();
                    long lost = myLeads.stream().filter(l -> "Lost".equals(l.getStatus())).count();
                    BigDecimal totalDeal = conversionRepository.sumDealValueBySalesUserId(rep.getId());
                    Map<String, Object> row = new HashMap<>();
                    row.put("Representative", rep.getName());
                    row.put("Email", rep.getEmail());
                    row.put("Department", rep.getDepartment() != null ? rep.getDepartment() : "Sales");
                    row.put("Assigned Leads", myLeads.size());
                    row.put("Converted", converted);
                    row.put("Lost", lost);
                    row.put("Total Deal Value", totalDeal != null ? totalDeal : BigDecimal.ZERO);
                    rows.add(row);
                }
                break;
            }
            case "roi-summary":
            default: {
                headers = List.of("Campaign", "Budget", "Total Spend", "Revenue Generated", "Leads", "Conversions", "CPL", "Cost/Conversion", "ROI (%)");
                List<Campaign> campaigns = campaignRepository.findAll();
                for (Campaign c : campaigns) {
                    BigDecimal spent = expenseRepository.sumExpensesByCampaignId(c.getId());
                    BigDecimal rev = conversionRepository.sumDealValueByCampaignId(c.getId());
                    if (rev == null || rev.compareTo(BigDecimal.ZERO) == 0) {
                        rev = c.getRevenueGenerated() != null ? c.getRevenueGenerated() : BigDecimal.ZERO;
                    }
                    long leads = leadRepository.findByCampaignId(c.getId()).size();
                    long convs = conversionRepository.findByCampaignId(c.getId()).size();

                    BigDecimal cpl = (leads > 0 && spent.compareTo(BigDecimal.ZERO) > 0)
                            ? spent.divide(BigDecimal.valueOf(leads), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    BigDecimal costPerConv = (convs > 0 && spent.compareTo(BigDecimal.ZERO) > 0)
                            ? spent.divide(BigDecimal.valueOf(convs), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                    double roi = 0.0;
                    if (spent.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal netGain = rev.subtract(spent);
                        roi = netGain.divide(spent, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
                        roi = Math.round(roi * 100.0) / 100.0;
                    }

                    Map<String, Object> row = new HashMap<>();
                    row.put("Campaign", c.getName());
                    row.put("Budget", c.getBudget());
                    row.put("Total Spend", spent);
                    row.put("Revenue Generated", rev);
                    row.put("Leads", leads);
                    row.put("Conversions", convs);
                    row.put("CPL", cpl);
                    row.put("Cost/Conversion", costPerConv);
                    row.put("ROI (%)", roi + "%");
                    rows.add(row);
                }
                break;
            }
        }

        result.put("reportType", reportType);
        result.put("headers", headers);
        result.put("rows", rows);
        result.put("count", rows.size());
        return result;
    }

    @Transactional(readOnly = true)
    public String generateCsv(String reportType) {
        Map<String, Object> data = getReportData(reportType);
        @SuppressWarnings("unchecked")
        List<String> headers = (List<String>) data.get("headers");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) data.get("rows");

        StringBuilder sb = new StringBuilder();
        // Header line
        sb.append(String.join(",", headers.stream().map(h -> "\"" + h + "\"").toList())).append("\n");

        // Row lines
        for (Map<String, Object> row : rows) {
            List<String> line = new ArrayList<>();
            for (String h : headers) {
                Object val = row.get(h);
                String str = (val != null) ? val.toString().replace("\"", "\"\"") : "";
                line.add("\"" + str + "\"");
            }
            sb.append(String.join(",", line)).append("\n");
        }
        return sb.toString();
    }
}
