package com.company.elms.service;

import com.company.elms.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class WorkingDayService {

    @Autowired
    private HolidayRepository holidayRepository;

    public boolean isWorkingDay(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return false;
        }
        return !holidayRepository.existsByHolidayDate(date);
    }

    public double calculateChargeableDays(LocalDate startDate, LocalDate endDate, boolean isHalfDay) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return 0.0;
        }

        if (isHalfDay) {
            return isWorkingDay(startDate) ? 0.5 : 0.0;
        }

        double chargeableDays = 0.0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (isWorkingDay(current)) {
                chargeableDays += 1.0;
            }
            current = current.plusDays(1);
        }
        return chargeableDays;
    }
}
