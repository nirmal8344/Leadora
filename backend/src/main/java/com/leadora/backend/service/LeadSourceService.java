package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.LeadSourceDto;
import com.leadora.backend.exception.ConflictException;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.LeadSource;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.LeadSourceRepository;

@Service
public class LeadSourceService {

    private final LeadSourceRepository leadSourceRepository;
    private final LeadRepository leadRepository;
    private final ConversionRepository conversionRepository;

    public LeadSourceService(LeadSourceRepository leadSourceRepository,
                             LeadRepository leadRepository,
                             ConversionRepository conversionRepository) {
        this.leadSourceRepository = leadSourceRepository;
        this.leadRepository = leadRepository;
        this.conversionRepository = conversionRepository;
    }

    @Transactional(readOnly = true)
    public List<LeadSourceDto> getAllSources() {
        return leadSourceRepository.findAll()
                .stream()
                .map(this::enrichDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeadSourceDto> getActiveSources() {
        return leadSourceRepository.findByActiveTrue()
                .stream()
                .map(this::enrichDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadSourceDto getSourceById(Long id) {
        LeadSource source = leadSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead source not found with id: " + id));
        return enrichDto(source);
    }

    @Transactional
    public LeadSourceDto createSource(LeadSourceDto dto) {
        if (leadSourceRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Lead source with name '" + dto.getName().trim() + "' already exists");
        }
        LeadSource source = new LeadSource();
        source.setName(dto.getName().trim());
        source.setType(dto.getType() != null ? dto.getType().trim() : "Other");
        source.setDescription(dto.getDescription());
        source.setActive(dto.isActive());

        LeadSource saved = leadSourceRepository.save(source);
        return enrichDto(saved);
    }

    @Transactional
    public LeadSourceDto updateSource(Long id, LeadSourceDto dto) {
        LeadSource source = leadSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead source not found with id: " + id));

        if (!source.getName().equalsIgnoreCase(dto.getName().trim()) &&
                leadSourceRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new ConflictException("Lead source with name '" + dto.getName().trim() + "' already exists");
        }

        source.setName(dto.getName().trim());
        if (dto.getType() != null) source.setType(dto.getType().trim());
        source.setDescription(dto.getDescription());
        source.setActive(dto.isActive());

        LeadSource saved = leadSourceRepository.save(source);
        return enrichDto(saved);
    }

    @Transactional
    public void deleteSource(Long id) {
        LeadSource source = leadSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead source not found with id: " + id));
        long leadCount = leadRepository.countBySourceId(id);
        if (leadCount > 0) {
            // Soft delete by deactivating so historical leads are not broken
            source.setActive(false);
            leadSourceRepository.save(source);
        } else {
            leadSourceRepository.delete(source);
        }
    }

    private LeadSourceDto enrichDto(LeadSource source) {
        LeadSourceDto dto = LeadSourceDto.fromEntity(source);
        long leads = leadRepository.countBySourceId(source.getId());
        long conversions = conversionRepository.findBySourceId(source.getId()).size();
        dto.setTotalLeads(leads);
        dto.setConvertedLeads(conversions);
        if (leads > 0) {
            double rate = ((double) conversions / leads) * 100.0;
            dto.setConversionRate(Math.round(rate * 100.0) / 100.0);
        } else {
            dto.setConversionRate(0.0);
        }
        return dto;
    }
}
