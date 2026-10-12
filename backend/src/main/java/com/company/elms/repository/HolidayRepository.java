package com.company.elms.repository;

import com.company.elms.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    Optional<Holiday> findByHolidayDate(LocalDate holidayDate);
    boolean existsByHolidayDate(LocalDate holidayDate);
    List<Holiday> findAllByOrderByHolidayDateAsc();
}
